import { resolve } from "node:path";
import type { ApiRouteIR, AppIR } from "../../ir/types.js";
import { writeGeneratedFile } from "../assets.js";
import { renderApiRouteTemplate, type ApiRouteTemplateId } from "../templates.js";

function apiRouteFilePath(pathname: string) {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  return `src/routes/${clean}.ts`;
}

function authImportBlock(route: ApiRouteIR) {
  if (route.auth !== "user") {
    return "";
  }

  return 'import { getSession } from "~/lib/server/guards";';
}

function authGuardBlock(route: ApiRouteIR) {
  if (route.auth !== "user") {
    return "";
  }

  return [
    "  const session = await getSession();",
    "  if (!session) {",
    '    return Response.json({ error: "Unauthorized" }, { status: 401 });',
    "  }",
    "",
  ].join("\n");
}

function templateIdForRoute(route: ApiRouteIR): ApiRouteTemplateId {
  switch (route.type) {
    case "json":
      return "json";
    case "webhook":
      return "webhook";
    case "presign-upload":
      return "presign-upload";
    default:
      return "json";
  }
}

export async function writeGeneratedApiRoutes(app: AppIR, targetPath: string) {
  let generated = 0;

  for (const route of app.apis ?? []) {
    const rendered = await renderApiRouteTemplate(templateIdForRoute(route), {
      METHOD: route.method,
      ROUTE_NAME: route.name,
      ROUTE_PATH: route.path,
      AUTH_IMPORT: authImportBlock(route),
      AUTH_GUARD: authGuardBlock(route),
    });

    await writeGeneratedFile(resolve(targetPath, apiRouteFilePath(route.path)), rendered);
    generated += 1;
  }

  return generated;
}

export async function renderGeneratedAuthHandlerRoute() {
  return renderApiRouteTemplate("auth-mount");
}
