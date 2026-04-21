import { resolve } from "node:path";
import type { AppIR, ServerModuleIR } from "../../ir/types.js";
import { writeGeneratedFile } from "../assets.js";
import { renderServerFunctionTemplate, type ServerFunctionTemplateId } from "../templates.js";

function camelCase(value: string) {
  return value
    .split(/[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .map((segment, index) =>
      index === 0 ? segment.toLowerCase() : `${segment[0]?.toUpperCase() ?? ""}${segment.slice(1).toLowerCase()}`,
    )
    .join("");
}

function pascalCase(value: string) {
  return value
    .split(/[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .map(segment => `${segment[0]?.toUpperCase() ?? ""}${segment.slice(1).toLowerCase()}`)
    .join("");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resourceSymbol(name?: string) {
  return camelCase(name ?? "resource");
}

function exportName(module: ServerModuleIR) {
  const resource = module.resource ? pascalCase(module.resource) : "";

  if (module.name.endsWith(".list")) return `list${resource}`;
  if (module.name.endsWith(".detail")) return `get${resource}`;
  if (module.name.endsWith(".create")) return `create${resource}`;
  if (module.name.endsWith(".update")) return `update${resource}`;
  if (module.name.endsWith(".delete")) return `delete${resource}`;
  if (module.name.includes("upload")) return `create${resource || "Upload"}Handshake`;

  return camelCase(module.name);
}

function templateIdFor(module: ServerModuleIR): ServerFunctionTemplateId {
  if (module.type === "query") {
    if (module.name.endsWith(".list")) return "list-query";
    if (module.name.endsWith(".detail")) return "detail-query";
    return "generic-query";
  }

  if (module.name.includes("upload")) return "upload-handshake-action";
  if (module.name.endsWith(".create")) return "create-action";
  if (module.name.endsWith(".update")) return "update-action";
  if (module.name.endsWith(".delete")) return "delete-action";
  return "generic-action";
}

function filePathFor(module: ServerModuleIR) {
  const folder = module.type === "query" ? "queries" : "actions";
  return `src/lib/server/${folder}/${slugify(module.name)}.ts`;
}

function authImport(module: ServerModuleIR, app: AppIR) {
  if (module.auth === "user" && app.auth) {
    return 'import { requireSession } from "~/lib/server/guards";';
  }

  return "";
}

function authCall(module: ServerModuleIR, app: AppIR) {
  if (module.auth === "user" && app.auth) {
    return "  await requireSession();";
  }

  return "";
}

export async function writeGeneratedServerModules(app: AppIR, targetPath: string) {
  const modules = app.server ?? [];

  for (const module of modules) {
    const templateId = templateIdFor(module);
    const rendered = await renderServerFunctionTemplate(templateId, {
      EXPORT_NAME: exportName(module),
      QUERY_KEY: module.name,
      RESOURCE_SYMBOL: resourceSymbol(module.resource),
      TYPE_NAME: `${pascalCase(module.resource ?? "Resource")}UpdateInput`,
      AUTH_IMPORT: authImport(module, app),
      AUTH_CALL: authCall(module, app),
    });

    await writeGeneratedFile(resolve(targetPath, filePathFor(module)), rendered);
  }

  return modules.length;
}
