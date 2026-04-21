import { query } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { {{RESOURCE_SYMBOL}} } from "~/lib/db/schema";
{{AUTH_IMPORT}}

export const {{EXPORT_NAME}} = query(async (id: typeof {{RESOURCE_SYMBOL}}.$inferSelect.id) => {
  "use server";
{{AUTH_CALL}}
  const rows = await db.select().from({{RESOURCE_SYMBOL}}).where(eq({{RESOURCE_SYMBOL}}.id, id)).limit(1);
  return rows[0] ?? null;
}, "{{QUERY_KEY}}");
