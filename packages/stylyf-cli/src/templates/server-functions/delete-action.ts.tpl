import { action } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { {{RESOURCE_SYMBOL}} } from "~/lib/db/schema";
{{AUTH_IMPORT}}

export const {{EXPORT_NAME}} = action(async (id: typeof {{RESOURCE_SYMBOL}}.$inferSelect.id) => {
  "use server";
{{AUTH_CALL}}
  return db.delete({{RESOURCE_SYMBOL}}).where(eq({{RESOURCE_SYMBOL}}.id, id)).returning();
}, "{{QUERY_KEY}}");
