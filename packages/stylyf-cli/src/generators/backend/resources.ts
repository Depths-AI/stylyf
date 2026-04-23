import type {
  AppIR,
  AuthAccess,
  DatabaseColumnType,
  DatabaseSchemaIR,
  ResourceAccessPreset,
  ResourceFieldIR,
  ResourceIR,
  ServerModuleIR,
} from "../../ir/types.js";

function camelCase(value: string) {
  return value
    .split(/[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .map((segment, index) =>
      index === 0 ? `${segment[0]?.toLowerCase() ?? ""}${segment.slice(1)}` : `${segment[0]?.toUpperCase() ?? ""}${segment.slice(1)}`,
    )
    .join("");
}

function uniqueByName<T extends { name: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.name)) {
      return false;
    }
    seen.add(item.name);
    return true;
  });
}

function tableNameFor(resource: ResourceIR) {
  return resource.table ?? resource.name;
}

function toDatabaseColumnType(field: ResourceFieldIR): DatabaseColumnType {
  switch (field.type) {
    case "longtext":
      return "text";
    case "date":
      return "timestamp";
    case "enum":
      return "varchar";
    default:
      return field.type;
  }
}

function toSchemaColumn(field: ResourceFieldIR): DatabaseSchemaIR["columns"][number] {
  return {
    name: field.name,
    type: toDatabaseColumnType(field),
    nullable: field.required === true ? false : true,
    primaryKey: field.primaryKey,
    unique: field.unique,
  };
}

function appendMissingColumn(
  columns: DatabaseSchemaIR["columns"],
  column: DatabaseSchemaIR["columns"][number],
) {
  if (!columns.some(existing => existing.name === column.name)) {
    columns.push(column);
  }
}

function deriveSchemaTable(resource: ResourceIR): DatabaseSchemaIR {
  const columns: DatabaseSchemaIR["columns"] = (resource.fields ?? []).map(toSchemaColumn);

  if (!columns.some(column => column.primaryKey)) {
    appendMissingColumn(columns, {
      name: "id",
      type: "uuid",
      primaryKey: true,
    });
  }

  if (resource.ownership?.model === "user") {
    appendMissingColumn(columns, {
      name: resource.ownership.ownerField ?? "owner_id",
      type: "uuid",
    });
  }

  if (resource.ownership?.model === "workspace") {
    appendMissingColumn(columns, {
      name: resource.ownership.workspaceField ?? "workspace_id",
      type: "uuid",
    });
  }

  for (const relation of resource.relations ?? []) {
    if (relation.kind === "belongs-to" && relation.field) {
      appendMissingColumn(columns, {
        name: relation.field,
        type: "uuid",
      });
    }
  }

  return {
    table: tableNameFor(resource),
    columns,
    timestamps: true,
  };
}

function accessToAuth(access?: ResourceAccessPreset): AuthAccess {
  return access === undefined || access === "public" ? "public" : "user";
}

function deriveServerModules(resource: ResourceIR): ServerModuleIR[] {
  const base = resource.name;
  return [
    {
      name: `${base}.list`,
      type: "query",
      resource: tableNameFor(resource),
      auth: accessToAuth(resource.access?.list ?? resource.access?.read),
    },
    {
      name: `${base}.detail`,
      type: "query",
      resource: tableNameFor(resource),
      auth: accessToAuth(resource.access?.read),
    },
    {
      name: `${base}.create`,
      type: "action",
      resource: tableNameFor(resource),
      auth: accessToAuth(resource.access?.create),
    },
    {
      name: `${base}.update`,
      type: "action",
      resource: tableNameFor(resource),
      auth: accessToAuth(resource.access?.update),
    },
    {
      name: `${base}.delete`,
      type: "action",
      resource: tableNameFor(resource),
      auth: accessToAuth(resource.access?.delete),
    },
  ];
}

export function materializeAppForGeneration(app: AppIR): AppIR {
  if (!app.resources || app.resources.length === 0) {
    return app;
  }

  const existingSchema = app.database?.schema ?? [];
  const existingTables = new Set(existingSchema.map(table => table.table));
  const derivedSchema = app.resources
    .map(resource => deriveSchemaTable(resource))
    .filter(table => !existingTables.has(table.table));

  const existingServer = app.server ?? [];
  const existingServerNames = new Set(existingServer.map(entry => entry.name));
  const derivedServer = app.resources
    .flatMap(resource => deriveServerModules(resource))
    .filter(module => !existingServerNames.has(module.name));

  return {
    ...app,
    database: app.database
      ? {
          ...app.database,
          schema: [...existingSchema, ...derivedSchema],
        }
      : app.database,
    server: [...existingServer, ...derivedServer],
  };
}

export function renderGeneratedResourcesModule(app: AppIR) {
  const resources = app.resources ?? [];
  const workflows = app.workflows ?? [];

  return [
    "export const resourceDefinitions = " + JSON.stringify(resources, null, 2) + " as const;",
    "",
    "export const workflowDefinitions = " + JSON.stringify(workflows, null, 2) + " as const;",
    "",
    "export const resourcesByName = Object.fromEntries(resourceDefinitions.map(resource => [resource.name, resource]));",
    "export const workflowsByName = Object.fromEntries(workflowDefinitions.map(workflow => [workflow.name, workflow]));",
    "",
  ].join("\n");
}

function schemaExportName(tableName: string) {
  return camelCase(tableName);
}

function schemaPropertyName(fieldName: string) {
  return camelCase(fieldName);
}

function relationExportName(resource: ResourceIR) {
  return `${camelCase(tableNameFor(resource))}Relations`;
}

export function renderGeneratedRelationsModule(app: AppIR) {
  const resources = uniqueByName(app.resources ?? []);
  const relatedResources = resources.filter(resource => (resource.relations ?? []).length > 0);
  const resourceTableLookup = new Map(resources.map(resource => [resource.name, tableNameFor(resource)]));

  if (relatedResources.length === 0) {
    return "";
  }

  const imports = new Set<string>(["relations"]);
  const schemaImports = new Set<string>();

  const blocks = relatedResources.map(resource => {
    const sourceExport = schemaExportName(tableNameFor(resource));
    schemaImports.add(sourceExport);

    const relationEntries = (resource.relations ?? [])
      .map(relation => {
        if (relation.kind === "belongs-to") {
          const targetExport = schemaExportName(resourceTableLookup.get(relation.target) ?? relation.target);
          schemaImports.add(targetExport);
          return `    ${camelCase(relation.target)}: one(${targetExport}, { fields: [${sourceExport}.${schemaPropertyName(relation.field ?? "id")}], references: [${targetExport}.id] }),`;
        }

        if (relation.kind === "has-many") {
          const targetExport = schemaExportName(resourceTableLookup.get(relation.target) ?? relation.target);
          schemaImports.add(targetExport);
          return `    ${camelCase(relation.target)}: many(${targetExport}),`;
        }

        const throughExport = schemaExportName(resourceTableLookup.get(relation.through ?? relation.target) ?? (relation.through ?? relation.target));
        schemaImports.add(throughExport);
        return `    ${camelCase(relation.target)}: many(${throughExport}),`;
      })
      .join("\n");

    const relationHelpers = (resource.relations ?? []).some(relation => relation.kind === "belongs-to")
      ? "{ one, many }"
      : "{ many }";

    return [
      `export const ${relationExportName(resource)} = relations(${sourceExport}, (${relationHelpers}) => ({`,
      relationEntries,
      "}));",
      "",
    ].join("\n");
  });

  return [
    `import { ${[...imports].sort().join(", ")} } from "drizzle-orm";`,
    `import { ${[...schemaImports].sort().join(", ")} } from "~/lib/db/schema";`,
    "",
    ...blocks,
  ].join("\n");
}
