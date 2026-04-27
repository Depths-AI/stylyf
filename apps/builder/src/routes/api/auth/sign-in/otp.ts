import type { APIEvent } from "@solidjs/start/server";
import { requestEmailOtp } from "~/lib/auth";

export async function POST(event: APIEvent) {
  const body = await event.request.json().catch(() => ({} as Record<string, unknown>));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const emailRedirectTo = typeof body.emailRedirectTo === "string" ? body.emailRedirectTo : undefined;
  const shouldCreateUser = typeof body.shouldCreateUser === "boolean" ? body.shouldCreateUser : undefined;

  if (!email) {
    return Response.json({ ok: false, error: "Email is required." }, { status: 400 });
  }

  const { data, error } = await requestEmailOtp({ email, emailRedirectTo, shouldCreateUser });
  if (error) return Response.json({ ok: false, error: error.message }, { status: 400 });
  return Response.json({ ok: true, data });
}
