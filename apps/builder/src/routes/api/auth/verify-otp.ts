import type { APIEvent } from "@solidjs/start/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { verifyEmailOtp } from "~/lib/auth";

export async function POST(event: APIEvent) {
  const body = await event.request.json().catch(() => ({} as Record<string, unknown>));
  const email = typeof body.email === "string" ? body.email.trim() : undefined;
  const token = typeof body.token === "string" ? body.token.trim() : undefined;
  const tokenHash = typeof body.tokenHash === "string" ? body.tokenHash.trim() : undefined;
  const type = (typeof body.type === "string" && body.type ? body.type : "email") as EmailOtpType;

  if (!token && !tokenHash) {
    return Response.json({ ok: false, error: "Either token or tokenHash is required." }, { status: 400 });
  }

  const { data, error } = await verifyEmailOtp({ email, token, tokenHash, type });
  if (error) return Response.json({ ok: false, error: error.message }, { status: 400 });
  return Response.json({ ok: true, data });
}
