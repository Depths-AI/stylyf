import type { APIEvent } from "@solidjs/start/server";
import { signOut } from "~/lib/auth";

export async function POST(_event: APIEvent) {
  const { error } = await signOut();
  if (error) return Response.json({ ok: false, error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
