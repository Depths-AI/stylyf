import { query } from "@solidjs/router";
{{AUTH_IMPORT}}

export const {{EXPORT_NAME}} = query(async () => {
  "use server";
{{AUTH_CALL}}
  return { ok: true };
}, "{{QUERY_KEY}}");
