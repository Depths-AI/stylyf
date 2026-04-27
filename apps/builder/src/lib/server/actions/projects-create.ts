import { action } from "@solidjs/router";
import { createSupabaseServerClient } from "~/lib/supabase";
import { requireViewerIdentity } from "~/lib/server/resource-policy";

type ProjectsInput = Record<string, unknown>;

export const createProjects = action(async (input: ProjectsInput) => {
  "use server";
  const { userId } = await requireViewerIdentity();
  const supabase = createSupabaseServerClient();
  const nextInput = { ...input, "owner_id": userId };
  const { data, error } = await supabase.from("projects").insert(nextInput).select("*");
  if (error) throw error;
  return data ?? [];
}, "projects.create");
