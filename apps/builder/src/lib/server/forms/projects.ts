import { action } from "@solidjs/router";
import { createProjects } from "~/lib/server/actions/projects-create";
import { updateProjects } from "~/lib/server/actions/projects-update";

export type ProjectsFormValues = {
  name: string;
  slug: string;
  status: "draft" | "generating" | "ready" | "error" | "archived";
  summary?: string | null;
  workspacePath?: string | null;
  previewUrl?: string | null;
  githubRepoFullName?: string | null;
  lastPushedSha?: string | null;
};

export type ProjectsFormFieldErrors = Partial<Record<"name" | "slug" | "status" | "summary" | "workspacePath" | "previewUrl" | "githubRepoFullName" | "lastPushedSha", string>>;

export type ProjectsFormResult =
  | { ok: true; message: string }
  | { ok: false; fieldErrors: ProjectsFormFieldErrors; formError?: string };

function readStringField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readBooleanField(formData: FormData, name: string) {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "1";
}

function readIntegerField(formData: FormData, name: string) {
  const value = readStringField(formData, name);
  if (!value) return { value: null as number | null };
  const next = Number.parseInt(value, 10);
  if (Number.isNaN(next)) {
    return { value: null as number | null, error: "Enter a whole number." };
  }
  return { value: next };
}

function readJsonField(formData: FormData, name: string) {
  const value = readStringField(formData, name);
  if (!value) return { value: null as Record<string, unknown> | null };
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return { value: parsed };
  } catch {
    return { value: null as Record<string, unknown> | null, error: "Enter valid JSON." };
  }
}

function readDateField(formData: FormData, name: string) {
  const value = readStringField(formData, name);
  if (!value) return { value: null as Date | null };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { value: null as Date | null, error: "Enter a valid date." };
  }
  return { value: parsed };
}

export function parseProjectsFormData(formData: FormData): { ok: true; values: ProjectsFormValues } | { ok: false; fieldErrors: ProjectsFormFieldErrors; formError?: string } {
  const values: Partial<ProjectsFormValues> = {};
  const fieldErrors: ProjectsFormFieldErrors = {};
  const nameValue = readStringField(formData, "name");
  if (nameValue == null || nameValue === "") {
    fieldErrors["name"] = "Name is required.";
  }
  if (nameValue) {
    values.name = nameValue;
  }

  const slugValue = readStringField(formData, "slug");
  if (slugValue == null || slugValue === "") {
    fieldErrors["slug"] = "Slug is required.";
  }
  if (slugValue) {
    values.slug = slugValue;
  }

  const statusValue = readStringField(formData, "status");
  if (statusValue == null || statusValue === "") {
    fieldErrors["status"] = "Status is required.";
  }
  if (statusValue) {
    if (!["draft","generating","ready","error","archived"].includes(statusValue)) {
      fieldErrors["status"] = "Status must be one of the configured options.";
    } else {
      values.status = statusValue as "draft" | "generating" | "ready" | "error" | "archived";
    }
  }

  const summaryValue = readStringField(formData, "summary");
  if (summaryValue) {
    values.summary = summaryValue;
  } else if (!fieldErrors["summary"]) {
    values.summary = null;
  }

  const workspacePathValue = readStringField(formData, "workspacePath");
  if (workspacePathValue) {
    values.workspacePath = workspacePathValue;
  } else if (!fieldErrors["workspacePath"]) {
    values.workspacePath = null;
  }

  const previewUrlValue = readStringField(formData, "previewUrl");
  if (previewUrlValue) {
    values.previewUrl = previewUrlValue;
  } else if (!fieldErrors["previewUrl"]) {
    values.previewUrl = null;
  }

  const githubRepoFullNameValue = readStringField(formData, "githubRepoFullName");
  if (githubRepoFullNameValue) {
    values.githubRepoFullName = githubRepoFullNameValue;
  } else if (!fieldErrors["githubRepoFullName"]) {
    values.githubRepoFullName = null;
  }

  const lastPushedShaValue = readStringField(formData, "lastPushedSha");
  if (lastPushedShaValue) {
    values.lastPushedSha = lastPushedShaValue;
  } else if (!fieldErrors["lastPushedSha"]) {
    values.lastPushedSha = null;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, formError: "Please fix the highlighted fields and try again." };
  }

  return { ok: true, values: values as ProjectsFormValues };
}

export const submitCreateProjectsForm = action(async (formData: FormData): Promise<ProjectsFormResult> => {
  "use server";
  const parsed = parseProjectsFormData(formData);
  if (!parsed.ok) return parsed;
  try {
    await createProjects(parsed.values as any);
    return { ok: true, message: "Project created successfully." };
  } catch (error) {
    return { ok: false, fieldErrors: {}, formError: error instanceof Error ? error.message : "Unable to save this record." };
  }
}, "projects.submit-create-form");

export const submitUpdateProjectsForm = action(async (id: string, formData: FormData): Promise<ProjectsFormResult> => {
  "use server";
  const parsed = parseProjectsFormData(formData);
  if (!parsed.ok) return parsed;
  try {
    await updateProjects({ id, ...parsed.values } as any);
    return { ok: true, message: "Project updated successfully." };
  } catch (error) {
    return { ok: false, fieldErrors: {}, formError: error instanceof Error ? error.message : "Unable to update this record." };
  }
}, "projects.submit-update-form");
