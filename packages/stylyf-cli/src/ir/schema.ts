import type { AppIR } from "./types.js";

export const appIrSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://stylyf.dev/schemas/app-ir.json",
  title: "Stylyf App IR",
  type: "object",
  required: ["name", "shell", "theme", "routes"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1 },
    shell: { enum: ["sidebar-app", "topbar-app", "docs-shell", "marketing-shell"] },
    theme: {
      type: "object",
      required: ["preset", "mode", "radius", "density", "spacing", "fonts"],
      additionalProperties: false,
      properties: {
        preset: { enum: ["amber", "emerald", "pearl", "opal"] },
        mode: { enum: ["light", "dark", "system"] },
        radius: { enum: ["edge", "trim", "soft", "mellow"] },
        density: { enum: ["compact", "comfortable", "relaxed"] },
        spacing: { enum: ["tight", "balanced", "airy"] },
        fonts: {
          type: "object",
          required: ["fancy", "sans", "mono"],
          additionalProperties: false,
          properties: {
            fancy: { type: "string", minLength: 1 },
            sans: { type: "string", minLength: 1 },
            mono: { type: "string", minLength: 1 },
          },
        },
      },
    },
    routes: {
      type: "array",
      minItems: 1,
    },
    env: {
      type: "object",
      additionalProperties: false,
      properties: {
        extras: {
          type: "array",
          items: {
            type: "object",
            required: ["name"],
            additionalProperties: false,
            properties: {
              name: { type: "string", minLength: 1 },
              exposure: { enum: ["server", "public"] },
              required: { type: "boolean" },
              example: { type: "string" },
              description: { type: "string" },
            },
          },
        },
      },
    },
    database: {
      type: "object",
      additionalProperties: false,
      properties: {
        provider: { enum: ["drizzle", "supabase"] },
        dialect: { enum: ["postgres", "sqlite"] },
        migrations: { enum: ["drizzle-kit"] },
        schema: {
          type: "array",
          items: {
            type: "object",
            required: ["table", "columns"],
            additionalProperties: false,
            properties: {
              table: { type: "string", minLength: 1 },
              columns: {
                type: "array",
                minItems: 1,
                items: {
                  type: "object",
                  required: ["name", "type"],
                  additionalProperties: false,
                  properties: {
                    name: { type: "string", minLength: 1 },
                    type: { enum: ["text", "varchar", "integer", "boolean", "timestamp", "jsonb", "uuid"] },
                    nullable: { type: "boolean" },
                    primaryKey: { type: "boolean" },
                    unique: { type: "boolean" },
                  },
                },
              },
              timestamps: { type: "boolean" },
            },
          },
        },
      },
    },
    resources: {
      type: "array",
      items: {
        type: "object",
        required: ["name"],
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 1 },
          table: { type: "string", minLength: 1 },
          visibility: { enum: ["private", "public", "mixed"] },
          workflow: { type: "string", minLength: 1 },
          fields: {
            type: "array",
            items: {
              type: "object",
              required: ["name", "type"],
              additionalProperties: false,
              properties: {
                name: { type: "string", minLength: 1 },
                type: { enum: ["text", "varchar", "integer", "boolean", "timestamp", "jsonb", "uuid", "longtext", "date", "enum"] },
                required: { type: "boolean" },
                unique: { type: "boolean" },
                indexed: { type: "boolean" },
                primaryKey: { type: "boolean" },
                enumValues: {
                  type: "array",
                  minItems: 1,
                  items: { type: "string", minLength: 1 },
                },
              },
            },
          },
          ownership: {
            type: "object",
            required: ["model"],
            additionalProperties: false,
            properties: {
              model: { enum: ["none", "user", "workspace"] },
              ownerField: { type: "string", minLength: 1 },
              workspaceField: { type: "string", minLength: 1 },
              membershipTable: { type: "string", minLength: 1 },
              roleField: { type: "string", minLength: 1 },
            },
          },
          access: {
            type: "object",
            additionalProperties: false,
            properties: {
              list: { enum: ["public", "user", "owner", "owner-or-public", "workspace-member", "admin"] },
              read: { enum: ["public", "user", "owner", "owner-or-public", "workspace-member", "admin"] },
              create: { enum: ["public", "user", "owner", "owner-or-public", "workspace-member", "admin"] },
              update: { enum: ["public", "user", "owner", "owner-or-public", "workspace-member", "admin"] },
              delete: { enum: ["public", "user", "owner", "owner-or-public", "workspace-member", "admin"] },
            },
          },
          relations: {
            type: "array",
            items: {
              type: "object",
              required: ["target", "kind"],
              additionalProperties: false,
              properties: {
                target: { type: "string", minLength: 1 },
                kind: { enum: ["belongs-to", "has-many", "many-to-many"] },
                field: { type: "string", minLength: 1 },
                through: { type: "string", minLength: 1 },
              },
            },
          },
          attachments: {
            type: "array",
            items: {
              type: "object",
              required: ["name", "kind"],
              additionalProperties: false,
              properties: {
                name: { type: "string", minLength: 1 },
                kind: { enum: ["file", "image", "video", "audio", "document"] },
                multiple: { type: "boolean" },
                required: { type: "boolean" },
                bucketAlias: { type: "string", minLength: 1 },
                metadataTable: { type: "string", minLength: 1 },
              },
            },
          },
        },
      },
    },
    workflows: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "resource", "initial", "states", "transitions"],
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 1 },
          resource: { type: "string", minLength: 1 },
          field: { type: "string", minLength: 1 },
          initial: { type: "string", minLength: 1 },
          states: {
            type: "array",
            minItems: 1,
            items: { type: "string", minLength: 1 },
          },
          transitions: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["name", "from", "to"],
              additionalProperties: false,
              properties: {
                name: { type: "string", minLength: 1 },
                from: {
                  oneOf: [
                    { type: "string", minLength: 1 },
                    {
                      type: "array",
                      minItems: 1,
                      items: { type: "string", minLength: 1 },
                    },
                  ],
                },
                to: { type: "string", minLength: 1 },
                actor: { enum: ["public", "user", "owner", "owner-or-public", "workspace-member", "admin"] },
                emits: {
                  type: "array",
                  items: { type: "string", minLength: 1 },
                },
                notifies: {
                  type: "array",
                  items: { enum: ["owner", "workspace", "watchers", "admins"] },
                },
              },
            },
          },
        },
      },
    },
    auth: {
      type: "object",
      required: ["provider"],
      additionalProperties: false,
      properties: {
        provider: { enum: ["better-auth", "supabase"] },
        mode: { enum: ["session"] },
        features: {
          type: "object",
          additionalProperties: false,
          properties: {
            emailPassword: { type: "boolean" },
            emailOtp: { type: "boolean" },
            magicLink: { type: "boolean" },
          },
        },
        protect: {
          type: "array",
          items: {
            type: "object",
            required: ["target", "kind", "access"],
            additionalProperties: false,
            properties: {
              target: { type: "string", minLength: 1 },
              kind: { enum: ["route", "api", "server"] },
              access: { enum: ["public", "user"] },
            },
          },
        },
      },
    },
    storage: {
      type: "object",
      required: ["provider"],
      additionalProperties: false,
      properties: {
        provider: { enum: ["s3"] },
        mode: { enum: ["presigned-put"] },
        bucketAlias: { type: "string", minLength: 1 },
      },
    },
    apis: {
      type: "array",
      items: {
        type: "object",
        required: ["path", "method", "type", "name"],
        additionalProperties: false,
        properties: {
          path: { type: "string", minLength: 1 },
          method: { enum: ["GET", "POST", "PATCH", "DELETE"] },
          type: { enum: ["json", "webhook", "presign-upload"] },
          name: { type: "string", minLength: 1 },
          auth: { enum: ["public", "user"] },
        },
      },
    },
    server: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "type"],
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 1 },
          type: { enum: ["query", "action"] },
          resource: { type: "string", minLength: 1 },
          auth: { enum: ["public", "user"] },
        },
      },
    },
  },
} as const satisfies Record<string, unknown>;

export function schemaAsJson() {
  return JSON.stringify(appIrSchema, null, 2);
}

export type AppIrSchema = typeof appIrSchema & { __type?: AppIR };
