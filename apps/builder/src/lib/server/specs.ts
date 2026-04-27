import { action, query, revalidate } from "@solidjs/router";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runCommand } from "@depths/stylyf-builder-core";
import { requireSession } from "~/lib/auth";
import { createSupabaseServerClient } from "~/lib/supabase";
import { getTimeline } from "~/lib/server/studio";

export type SpecChunkKind = "brief" | "style" | "routes" | "data" | "api" | "media" | "raw";

export type SpecChunkRecord = {
  id: string;
  project_id: string;
  name: string;
  kind: SpecChunkKind;
  spec_text: string;
  spec_path: string | null;
  version: number;
  is_active: boolean;
  created_at: string;
};

const specChunkKinds: SpecChunkKind[] = ["brief", "style", "routes", "data", "api", "media", "raw"];

async function getUserId() {
  const session = await requireSession();
  return session.user.id;
}

async function requireProject(projectId: string, userId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, owner_id, name, workspacePath")
    .eq("id", projectId)
    .eq("owner_id", userId)
    .single();
  if (error) throw error;
  return data as { id: string; owner_id: string; name: string; workspacePath: string | null };
}

function parseKind(value: FormDataEntryValue | null): SpecChunkKind {
  if (typeof value !== "string" || !specChunkKinds.includes(value as SpecChunkKind)) {
    throw new Error("Choose a valid spec pane.");
  }
  return value as SpecChunkKind;
}

function parseSpecText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error("Spec pane cannot be empty.");
  JSON.parse(text);
  return text;
}

function chunkFileName(kind: SpecChunkKind) {
  return `${kind}.chunk.json`;
}

async function writeChunkFile(input: { workspacePath: string; kind: SpecChunkKind; specText: string }) {
  const specsPath = join(input.workspacePath, "specs");
  await mkdir(specsPath, { recursive: true });
  const path = join(specsPath, chunkFileName(input.kind));
  await writeFile(path, `${input.specText.trim()}\n`, "utf8");
  return path;
}

async function recordEvent(input: { projectId: string; userId: string; type: string; summary: string; artifactPath?: string | null }) {
  await createSupabaseServerClient().from("agent_events").insert({
    project_id: input.projectId,
    owner_id: input.userId,
    type: input.type,
    summary: input.summary.slice(0, 500),
    artifact_path: input.artifactPath ?? null,
  });
}

export const getSpecChunks = query(async (projectId: string): Promise<SpecChunkRecord[]> => {
  "use server";
  if (projectId === "demo") return [];
  const userId = await getUserId();
  await requireProject(projectId, userId);
  const { data, error } = await createSupabaseServerClient()
    .from("stylyf_spec_chunks")
    .select("id, project_id, name, kind, spec_text, spec_path, version, is_active, created_at")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SpecChunkRecord[];
}, "builder.specs.chunks");

export const saveSpecChunk = action(async (projectId: string, formData: FormData) => {
  "use server";
  if (projectId === "demo") throw new Error("Open a real project before saving spec panes.");
  const userId = await getUserId();
  const project = await requireProject(projectId, userId);
  if (!project.workspacePath) throw new Error("This project workspace is not ready yet.");

  const kind = parseKind(formData.get("kind"));
  const specText = parseSpecText(formData.get("specText"));
  const specPath = await writeChunkFile({ workspacePath: project.workspacePath, kind, specText });
  const supabase = createSupabaseServerClient();

  const { data: latest, error: latestError } = await supabase
    .from("stylyf_spec_chunks")
    .select("version")
    .eq("project_id", projectId)
    .eq("kind", kind)
    .order("version", { ascending: false })
    .limit(1);
  if (latestError) throw latestError;
  const version = Number(latest?.[0]?.version ?? 0) + 1;

  const { error: deactivateError } = await supabase
    .from("stylyf_spec_chunks")
    .update({ is_active: false })
    .eq("project_id", projectId)
    .eq("kind", kind)
    .eq("is_active", true);
  if (deactivateError) throw deactivateError;

  const { error } = await supabase.from("stylyf_spec_chunks").insert({
    project_id: projectId,
    name: `${kind} chunk`,
    kind,
    spec_text: specText,
    spec_path: specPath,
    version,
    is_active: true,
    created_by: userId,
  });
  if (error) throw error;

  await recordEvent({ projectId, userId, type: "spec.chunk.saved", summary: `Saved ${kind} spec pane.`, artifactPath: specPath });
  await revalidate(getSpecChunks.keyFor(projectId));
  await revalidate(getTimeline.keyFor(projectId));
  return { ok: true };
}, "builder.specs.save-chunk");

async function activeChunkPaths(projectId: string, userId: string) {
  const project = await requireProject(projectId, userId);
  if (!project.workspacePath) throw new Error("This project workspace is not ready yet.");
  const workspacePath = project.workspacePath;
  const chunks = await getSpecChunks(projectId);
  if (chunks.length === 0) throw new Error("Save at least one spec pane before composing.");

  const paths: string[] = [];
  for (const chunk of chunks) {
    const path = await writeChunkFile({
      workspacePath,
      kind: chunk.kind,
      specText: chunk.spec_text,
    });
    paths.push(path);
  }
  return { project: { ...project, workspacePath }, paths };
}

export const composeSpec = action(async (projectId: string) => {
  "use server";
  if (projectId === "demo") throw new Error("Open a real project before composing specs.");
  const userId = await getUserId();
  const { project, paths } = await activeChunkPaths(projectId, userId);
  const args = ["compose", "--base", "specs/base.json"];
  for (const path of paths) args.push("--with", path);
  args.push("--output", "stylyf.spec.json");

  const result = await runCommand({
    command: "stylyf",
    args,
    cwd: project.workspacePath,
    logsDir: join(project.workspacePath, "logs"),
  });
  const status = result.exitCode === 0 ? "completed" : "failed";
  await createSupabaseServerClient().from("commands").insert({
    project_id: projectId,
    command: `stylyf ${args.join(" ")}`,
    cwd: project.workspacePath,
    status,
    exit_code: result.exitCode,
    stdout_path: result.stdoutPath,
    stderr_path: result.stderrPath,
    completed_at: new Date().toISOString(),
  });
  await recordEvent({ projectId, userId, type: "spec.composed", summary: status === "completed" ? "Composed Stylyf spec." : "Spec compose failed." });
  await revalidate(getTimeline.keyFor(projectId));
  if (result.exitCode !== 0) throw new Error("Spec compose failed. Check the recorded command logs.");
  return { ok: true };
}, "builder.specs.compose");

export const validateSpec = action(async (projectId: string) => {
  "use server";
  if (projectId === "demo") throw new Error("Open a real project before validating specs.");
  const userId = await getUserId();
  const project = await requireProject(projectId, userId);
  if (!project.workspacePath) throw new Error("This project workspace is not ready yet.");

  const result = await runCommand({
    command: "stylyf",
    args: ["validate", "--spec", "stylyf.spec.json"],
    cwd: project.workspacePath,
    logsDir: join(project.workspacePath, "logs"),
  });
  const status = result.exitCode === 0 ? "completed" : "failed";
  await createSupabaseServerClient().from("commands").insert({
    project_id: projectId,
    command: "stylyf validate --spec stylyf.spec.json",
    cwd: project.workspacePath,
    status,
    exit_code: result.exitCode,
    stdout_path: result.stdoutPath,
    stderr_path: result.stderrPath,
    completed_at: new Date().toISOString(),
  });
  await recordEvent({ projectId, userId, type: "spec.validated", summary: status === "completed" ? "Validated Stylyf spec." : "Spec validation failed." });
  await revalidate(getTimeline.keyFor(projectId));
  if (result.exitCode !== 0) throw new Error("Spec validation failed. Check the recorded command logs.");
  return { ok: true };
}, "builder.specs.validate");

export const planSpec = action(async (projectId: string) => {
  "use server";
  if (projectId === "demo") throw new Error("Open a real project before planning specs.");
  const userId = await getUserId();
  const project = await requireProject(projectId, userId);
  if (!project.workspacePath) throw new Error("This project workspace is not ready yet.");

  const result = await runCommand({
    command: "stylyf",
    args: ["plan", "--spec", "stylyf.spec.json", "--resolved"],
    cwd: project.workspacePath,
    logsDir: join(project.workspacePath, "logs"),
  });
  const status = result.exitCode === 0 ? "completed" : "failed";
  await createSupabaseServerClient().from("commands").insert({
    project_id: projectId,
    command: "stylyf plan --spec stylyf.spec.json --resolved",
    cwd: project.workspacePath,
    status,
    exit_code: result.exitCode,
    stdout_path: result.stdoutPath,
    stderr_path: result.stderrPath,
    completed_at: new Date().toISOString(),
  });
  await recordEvent({ projectId, userId, type: "spec.planned", summary: status === "completed" ? "Planned Stylyf generation." : "Spec planning failed." });
  await revalidate(getTimeline.keyFor(projectId));
  if (result.exitCode !== 0) throw new Error("Spec planning failed. Check the recorded command logs.");
  return { ok: true };
}, "builder.specs.plan");
