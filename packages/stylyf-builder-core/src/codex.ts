import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";

const tokenNamePattern = /(TOKEN|SECRET|PASSWORD|KEY|AUTH|COOKIE|SESSION|SUPABASE_SECRET|AWS_SECRET)/i;
const tokenValuePattern = /(sb_secret_[A-Za-z0-9._-]+|sk-[A-Za-z0-9._-]+|gh[pousr]_[A-Za-z0-9_]+|AKIA[0-9A-Z]{16})/g;

function redactAgentText(input: string) {
  return input
    .split(/\r?\n/g)
    .map(line => {
      const [key] = line.split("=", 1);
      if (key && tokenNamePattern.test(key)) {
        return `${key}=<redacted>`;
      }
      return line.replace(tokenValuePattern, "<redacted>");
    })
    .join("\n");
}

export type AgentRole = "system" | "user" | "assistant" | "tool";

export type BuilderAgentEvent =
  | { type: "session.started"; sessionId: string; provider: string; workspacePath: string }
  | { type: "turn.started"; sessionId: string; turnId: string; prompt: string }
  | { type: "message"; sessionId: string; role: AgentRole; content: string }
  | { type: "approval.requested"; sessionId: string; approvalId: string; summary: string; payload?: unknown }
  | { type: "tool.event"; sessionId: string; name: string; summary: string; payload?: unknown }
  | { type: "turn.completed"; sessionId: string; turnId: string; summary: string }
  | { type: "session.error"; sessionId: string; message: string };

export type BuilderAgentSession = {
  id: string;
  provider: "codex-app-server" | "manual";
  workspacePath: string;
  startedAt: Date;
};

export type StartAgentSessionInput = {
  workspacePath: string;
  systemPrompt: string;
};

export type SendAgentTurnInput = {
  sessionId: string;
  prompt: string;
};

export type BuilderAgentAdapter = {
  readonly provider: BuilderAgentSession["provider"];
  startSession(input: StartAgentSessionInput): AsyncIterable<BuilderAgentEvent>;
  sendTurn(input: SendAgentTurnInput): AsyncIterable<BuilderAgentEvent>;
  stopSession(sessionId: string): Promise<void>;
};

export class ManualAgentAdapter implements BuilderAgentAdapter {
  readonly provider = "manual" as const;
  #sessions = new Map<string, BuilderAgentSession>();

  async *startSession(input: StartAgentSessionInput): AsyncIterable<BuilderAgentEvent> {
    const session: BuilderAgentSession = {
      id: randomUUID(),
      provider: this.provider,
      workspacePath: input.workspacePath,
      startedAt: new Date(),
    };
    this.#sessions.set(session.id, session);
    yield {
      type: "session.started",
      sessionId: session.id,
      provider: this.provider,
      workspacePath: input.workspacePath,
    };
    yield {
      type: "message",
      sessionId: session.id,
      role: "system",
      content: redactAgentText(input.systemPrompt),
    };
  }

  async *sendTurn(input: SendAgentTurnInput): AsyncIterable<BuilderAgentEvent> {
    const session = this.#sessions.get(input.sessionId);
    if (!session) {
      yield { type: "session.error", sessionId: input.sessionId, message: "Manual session not found." };
      return;
    }

    const turnId = randomUUID();
    yield { type: "turn.started", sessionId: session.id, turnId, prompt: redactAgentText(input.prompt) };
    yield {
      type: "message",
      sessionId: session.id,
      role: "assistant",
      content: "Manual adapter recorded the turn. Wire Codex App Server to execute this prompt.",
    };
    yield {
      type: "turn.completed",
      sessionId: session.id,
      turnId,
      summary: "Manual fallback completed without mutating the workspace.",
    };
  }

  async stopSession(sessionId: string) {
    this.#sessions.delete(sessionId);
  }
}

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params?: unknown;
};

type JsonRpcResponse = {
  id?: string;
  method?: string;
  result?: unknown;
  error?: { message?: string };
  params?: unknown;
};

export class CodexAppServerAdapter implements BuilderAgentAdapter {
  readonly provider = "codex-app-server" as const;
  #command: string;
  #args: string[];
  #processes = new Map<string, ChildProcessWithoutNullStreams>();

  constructor(input: { command?: string; args?: string[] } = {}) {
    this.#command = input.command ?? "codex";
    this.#args = input.args ?? ["app-server", "--stdio"];
  }

  async *startSession(input: StartAgentSessionInput): AsyncIterable<BuilderAgentEvent> {
    const sessionId = randomUUID();
    const child = spawn(this.#command, this.#args, {
      cwd: input.workspacePath,
      shell: false,
      env: process.env,
    });
    this.#processes.set(sessionId, child);

    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: randomUUID(),
      method: "session/start",
      params: {
        cwd: input.workspacePath,
        systemPrompt: input.systemPrompt,
      },
    };
    child.stdin.write(`${JSON.stringify(request)}\n`);

    yield {
      type: "session.started",
      sessionId,
      provider: this.provider,
      workspacePath: input.workspacePath,
    };

    const lines = createInterface({ input: child.stdout });
    for await (const line of lines) {
      const event = parseCodexEvent(sessionId, line);
      if (event) yield event;
      if (event?.type === "turn.completed") break;
    }
  }

  async *sendTurn(input: SendAgentTurnInput): AsyncIterable<BuilderAgentEvent> {
    const child = this.#processes.get(input.sessionId);
    if (!child) {
      yield { type: "session.error", sessionId: input.sessionId, message: "Codex App Server session not found." };
      return;
    }

    const turnId = randomUUID();
    yield { type: "turn.started", sessionId: input.sessionId, turnId, prompt: redactAgentText(input.prompt) };
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: turnId,
      method: "turn/send",
      params: { prompt: input.prompt },
    };
    child.stdin.write(`${JSON.stringify(request)}\n`);

    const lines = createInterface({ input: child.stdout });
    for await (const line of lines) {
      const event = parseCodexEvent(input.sessionId, line);
      if (event) yield event;
      if (event?.type === "turn.completed") break;
    }
  }

  async stopSession(sessionId: string) {
    const child = this.#processes.get(sessionId);
    if (!child) return;
    child.kill("SIGTERM");
    this.#processes.delete(sessionId);
  }
}

function parseCodexEvent(sessionId: string, line: string): BuilderAgentEvent | undefined {
  if (!line.trim()) return undefined;
  let payload: JsonRpcResponse;
  try {
    payload = JSON.parse(line) as JsonRpcResponse;
  } catch {
    return { type: "message", sessionId, role: "tool", content: redactAgentText(line) };
  }

  if (payload.error) {
    return { type: "session.error", sessionId, message: redactAgentText(payload.error.message ?? "Codex App Server error.") };
  }

  const method = payload.method ?? "";
  if (method.includes("approval")) {
    return {
      type: "approval.requested",
      sessionId,
      approvalId: randomUUID(),
      summary: "Codex requested approval.",
      payload: payload.params,
    };
  }
  if (method.includes("tool")) {
    return {
      type: "tool.event",
      sessionId,
      name: method,
      summary: "Codex emitted a tool event.",
      payload: payload.params,
    };
  }
  if (method.includes("message")) {
    return {
      type: "message",
      sessionId,
      role: "assistant",
      content: redactAgentText(JSON.stringify(payload.params ?? payload.result ?? "")),
    };
  }
  if (method.includes("complete") || payload.id) {
    return {
      type: "turn.completed",
      sessionId,
      turnId: String(payload.id ?? randomUUID()),
      summary: "Codex turn completed.",
    };
  }
  return {
    type: "tool.event",
    sessionId,
    name: method || "codex.event",
    summary: "Codex emitted an event.",
    payload,
  };
}
