import { action } from "@solidjs/router";
import { createProjectWorkspace, runCommand, slugify, writeJson } from "@depths/stylyf-builder-core";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createSupabaseServerClient } from "~/lib/supabase";
import { requireViewerIdentity } from "~/lib/server/resource-policy";
import { recordTelemetry } from "~/lib/server/telemetry";

type ProjectRow = Record<string, unknown>;

async function getProject(projectId: string, userId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).eq("owner_id", userId).single();
  if (error) throw error;
  return data as ProjectRow;
}

async function ensureWorkspace(project: ProjectRow) {
  const existing = typeof project.workspacePath === "string" ? project.workspacePath : "";
  if (existing) {
    await mkdir(join(existing, "logs"), { recursive: true });
    await mkdir(join(existing, "app"), { recursive: true });
    return {
      root: existing,
      app: join(existing, "app"),
      logs: join(existing, "logs"),
      handoff: join(existing, "handoff.md"),
      repo: join(existing, "repo.json"),
    };
  }

  const workspace = await createProjectWorkspace({
    projectId: String(project.id),
    name: String(project.name ?? "Untitled project"),
  });
  await createSupabaseServerClient().from("projects").update({ workspacePath: workspace.root }).eq("id", project.id);
  return workspace;
}

async function recordCommand(input: {
  projectId: string;
  command: string;
  cwd: string;
  status: "completed" | "failed";
  exitCode: number | null;
  stdoutPath: string;
  stderrPath: string;
}) {
  const supabase = createSupabaseServerClient();
  await supabase.from("commands").insert({
    project_id: input.projectId,
    command: input.command,
    cwd: input.cwd,
    status: input.status,
    exit_code: input.exitCode,
    stdout_path: input.stdoutPath,
    stderr_path: input.stderrPath,
    completed_at: new Date().toISOString(),
  });
}

async function runGit(projectId: string, cwd: string, logsDir: string, args: string[]) {
  const result = await runCommand({ command: "git", args, cwd, logsDir });
  await recordCommand({
    projectId,
    command: `git ${args.join(" ")}`,
    cwd,
    status: result.exitCode === 0 ? "completed" : "failed",
    exitCode: result.exitCode,
    stdoutPath: result.stdoutPath,
    stderrPath: result.stderrPath,
  });
  return result;
}

async function createGithubRepo(input: { repoName: string }) {
  const token = process.env.GITHUB_TOKEN;
  const org = process.env.GITHUB_ORG ?? "Depths-AI";
  if (!token) return null;

  const response = await fetch(`https://api.github.com/orgs/${org}/repos`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      name: input.repoName,
      private: true,
      auto_init: false,
    }),
  });
  if (!response.ok && response.status !== 422) {
    throw new Error(`GitHub repo creation failed: ${response.status} ${response.statusText}`);
  }
  return {
    fullName: `${org}/${input.repoName}`,
    sshUrl: `git@github.com:${org}/${input.repoName}.git`,
  };
}

export const commitAndPushProject = action(async (projectId: string, formData: FormData) => {
  "use server";
  const { userId } = await requireViewerIdentity();
  const project = await getProject(projectId, userId);
  const workspace = await ensureWorkspace(project);
  const message = String(formData.get("message") ?? "Update generated app").trim() || "Update generated app";
  const appPath = workspace.app;
  if (!existsSync(join(appPath, "package.json"))) {
    throw new Error("Generate the app before creating a git commit.");
  }

  const supabase = createSupabaseServerClient();
  if (!existsSync(join(appPath, ".git"))) {
    await runGit(projectId, appPath, workspace.logs, ["init"]);
    await runGit(projectId, appPath, workspace.logs, ["config", "user.email", "builder@depthsai.com"]);
    await runGit(projectId, appPath, workspace.logs, ["config", "user.name", "Stylyf Builder"]);
    await runGit(projectId, appPath, workspace.logs, ["branch", "-M", "main"]);
  }

  let repoFullName = typeof project.githubRepoFullName === "string" ? project.githubRepoFullName : "";
  if (!repoFullName) {
    const repoName = slugify(`${String(project.name ?? "stylyf-app")}-${projectId.slice(0, 8)}`);
    const repo = await createGithubRepo({ repoName });
    if (repo) {
      repoFullName = repo.fullName;
      await runGit(projectId, appPath, workspace.logs, ["remote", "add", "origin", repo.sshUrl]);
      await writeJson(workspace.repo, repo);
      await supabase.from("git_events").insert({
        project_id: projectId,
        kind: "repo_created",
        repo_full_name: repo.fullName,
        branch: "main",
        summary: "Private GitHub repository created for generated app.",
        payload_path: workspace.repo,
      });
      await supabase.from("projects").update({ githubRepoFullName: repo.fullName }).eq("id", projectId);
    }
  }

  await writeFile(workspace.handoff, `# ${String(project.name ?? "Generated app")}\n\nLatest accepted iteration: ${message}\n\nDeployment remains a manual dev-team handoff.\n`, "utf8");
  await runGit(projectId, appPath, workspace.logs, ["add", "."]);
  const commit = await runGit(projectId, appPath, workspace.logs, ["commit", "-m", message]);
  const committed = commit.exitCode === 0;
  await supabase.from("git_events").insert({
    project_id: projectId,
    kind: committed ? "commit_created" : "push_failed",
    repo_full_name: repoFullName || null,
    branch: "main",
    summary: committed ? message : "No commit was created; check git command logs.",
    payload_path: workspace.handoff,
  });

  if (!committed) {
    throw new Error("Git commit failed. Check command logs for details.");
  }

  await recordTelemetry({ projectId, userId, kind: "commit.created", summary: message, artifactPath: workspace.handoff });
  if (repoFullName) {
    const push = await runGit(projectId, appPath, workspace.logs, ["push", "-u", "origin", "main"]);
    const pushed = push.exitCode === 0;
    await supabase.from("git_events").insert({
      project_id: projectId,
      kind: pushed ? "push_completed" : "push_failed",
      repo_full_name: repoFullName,
      branch: "main",
      summary: pushed ? "Generated app commit pushed to GitHub." : "Git push failed. Check command logs.",
      payload_path: pushed ? push.stdoutPath : push.stderrPath,
    });
    await recordTelemetry({
      projectId,
      userId,
      kind: pushed ? "push.completed" : "push.failed",
      summary: pushed ? "Generated app commit pushed to GitHub." : "Git push failed.",
      artifactPath: pushed ? push.stdoutPath : push.stderrPath,
    });
    if (!pushed) throw new Error("Git push failed. Check command logs for details.");
  } else {
    await supabase.from("git_events").insert({
      project_id: projectId,
      kind: "push_failed",
      branch: "main",
      summary: "No GITHUB_TOKEN was configured, so the commit remains local in the generated app workspace.",
      payload_path: workspace.handoff,
    });
    await recordTelemetry({
      projectId,
      userId,
      kind: "push.failed",
      summary: "No GitHub token configured; commit remains local.",
      artifactPath: workspace.handoff,
    });
  }

  await supabase.from("git_events").insert({
    project_id: projectId,
    kind: "handoff_ready",
    repo_full_name: repoFullName || null,
    branch: "main",
    summary: "Generated app is ready for manual dev-team review.",
    payload_path: workspace.handoff,
  });
  await supabase.from("projects").update({ status: "ready" }).eq("id", projectId);
  return { ok: true, pushed: Boolean(repoFullName), repoFullName: repoFullName || null };
}, "git.commit-and-push-project");
