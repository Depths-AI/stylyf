import { action } from "@solidjs/router";
import { db } from "~/lib/db";
import { {{RESOURCE_SYMBOL}} } from "~/lib/db/schema";
{{AUTH_IMPORT}}

export const {{EXPORT_NAME}} = action(async (input: typeof {{RESOURCE_SYMBOL}}.$inferInsert) => {
  "use server";
{{AUTH_CALL}}
  return db.insert({{RESOURCE_SYMBOL}}).values(input).returning();
}, "{{QUERY_KEY}}");
