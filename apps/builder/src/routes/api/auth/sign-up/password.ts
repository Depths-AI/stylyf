import type { APIEvent } from "@solidjs/start/server";
import { signUpWithPassword } from "~/lib/auth";

export async function POST(event: APIEvent) {
  const body = await event.request.json().catch(() => ({} as Record<string, unknown>));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const metadata = typeof body.metadata === "object" && body.metadata ? body.metadata : undefined;

  if (!email || !password) {
    return Response.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  const { data, error } = await signUpWithPassword({ email, password, metadata: metadata as Record<string, unknown> | undefined });
  if (error) return Response.json({ ok: false, error: error.message }, { status: 400 });
  return Response.json({ ok: true, data });
}
