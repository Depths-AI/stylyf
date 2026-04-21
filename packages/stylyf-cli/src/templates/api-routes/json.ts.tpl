import type { APIEvent } from "@solidjs/start/server";
{{AUTH_IMPORT}}

export async function {{METHOD}}(event: APIEvent) {
{{AUTH_GUARD}}
  const url = new URL(event.request.url);
  const body = event.request.method === "GET" ? null : await event.request.json().catch(() => null);

  return Response.json({
    ok: true,
    route: "{{ROUTE_NAME}}",
    method: "{{METHOD}}",
    path: "{{ROUTE_PATH}}",
    params: event.params,
    query: Object.fromEntries(url.searchParams.entries()),
    body,
  });
}
