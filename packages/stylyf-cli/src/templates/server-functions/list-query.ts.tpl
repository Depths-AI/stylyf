import { query } from "@solidjs/router";
import { db } from "~/lib/db";
import { {{RESOURCE_SYMBOL}} } from "~/lib/db/schema";
{{AUTH_IMPORT}}

export const {{EXPORT_NAME}} = query(async () => {
  "use server";
{{AUTH_CALL}}
  return db.select().from({{RESOURCE_SYMBOL}});
}, "{{QUERY_KEY}}");
