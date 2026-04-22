import { action } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { {{RESOURCE_SYMBOL}} } from "~/lib/db/schema";
{{AUTH_IMPORT}}

type {{TYPE_NAME}} = Partial<typeof {{RESOURCE_SYMBOL}}.$inferInsert> & {
  id: typeof {{RESOURCE_SYMBOL}}.$inferSelect.id;
};

export const {{EXPORT_NAME}} = action(async (input: {{TYPE_NAME}}) => {
  "use server";
{{AUTH_CALL}}
  const { id, ...changes } = input;
  return db.update({{RESOURCE_SYMBOL}}).set(changes).where(eq({{RESOURCE_SYMBOL}}.id, id)).returning();
}, "{{QUERY_KEY}}");
