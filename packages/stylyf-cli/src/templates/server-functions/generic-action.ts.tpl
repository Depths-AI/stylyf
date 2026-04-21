import { action } from "@solidjs/router";
{{AUTH_IMPORT}}

export const {{EXPORT_NAME}} = action(async (input: Record<string, unknown>) => {
  "use server";
{{AUTH_CALL}}
  return { ok: true, input };
}, "{{QUERY_KEY}}");
