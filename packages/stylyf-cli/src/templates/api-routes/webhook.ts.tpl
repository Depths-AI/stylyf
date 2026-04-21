import type { APIEvent } from "@solidjs/start/server";
{{AUTH_IMPORT}}

export async function {{METHOD}}(event: APIEvent) {
{{AUTH_GUARD}}
  const payload = await event.request.text();
  const signature = event.request.headers.get("x-signature");

  return Response.json({
    ok: true,
    route: "{{ROUTE_NAME}}",
    method: "{{METHOD}}",
    path: "{{ROUTE_PATH}}",
    receivedBytes: payload.length,
    hasSignature: Boolean(signature),
    note: "Add provider-specific webhook signature verification before production use.",
  });
}
