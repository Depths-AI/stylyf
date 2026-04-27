import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const source = readFileSync(path, "utf8");
  for (const line of source.split(/\r?\n/g)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [name, ...rawParts] = trimmed.split("=");
    if (!name || process.env[name] !== undefined) continue;
    const rawValue = rawParts.join("=");
    process.env[name] = rawValue.replace(/^["\']|["\']$/g, "");
  }
}

for (const candidate of [".env.local", ".env"]) {
  loadEnvFile(resolve(process.cwd(), candidate));
}

const requiredEnv = [
  {
    "name": "APP_BASE_URL",
    "required": true,
    "exposure": "server",
    "example": "http://localhost:3000",
    "description": "Canonical app URL used by auth and server-side absolute links."
  },
  {
    "name": "SUPABASE_URL",
    "required": true,
    "exposure": "server",
    "example": "https://your-project-ref.supabase.co",
    "description": "Supabase project URL used by server-side auth and data clients."
  },
  {
    "name": "SUPABASE_PUBLISHABLE_KEY",
    "required": true,
    "exposure": "server",
    "example": "sb_publishable_xxx",
    "description": "Server-side copy of the Supabase publishable key used for SSR auth and request-scoped data access."
  },
  {
    "name": "SUPABASE_SECRET_KEY",
    "required": true,
    "exposure": "server",
    "example": "sb_secret_xxx",
    "description": "Server-only Supabase secret key for privileged admin and bypass-RLS operations."
  },
  {
    "name": "VITE_SUPABASE_URL",
    "required": true,
    "exposure": "public",
    "example": "https://your-project-ref.supabase.co",
    "description": "Client-exposed Supabase project URL for browser auth flows."
  },
  {
    "name": "VITE_SUPABASE_PUBLISHABLE_KEY",
    "required": true,
    "exposure": "public",
    "example": "sb_publishable_xxx",
    "description": "Client-exposed Supabase publishable key for browser auth and data access."
  },
  {
    "name": "S3_BUCKET",
    "required": true,
    "exposure": "server",
    "example": "app-uploads",
    "description": "Target bucket for generated storage helpers."
  }
] as const;
const publicEnvNames: readonly string[] = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY"
];

function isProbablyUrl(value: string) {
  try { new URL(value); return true; } catch { return false; }
}

function checkEnv() {
  const issues: string[] = [];
  for (const entry of requiredEnv) {
    const value = process.env[entry.name];
    if (!value) {
      issues.push(`Missing required ${entry.exposure} env: ${entry.name}`);
      continue;
    }
    if ((entry.name.endsWith("_URL") || entry.name === "APP_BASE_URL") && !isProbablyUrl(value)) {
      issues.push(`${entry.name} must be a valid absolute URL.`);
    }
  }
  for (const name of publicEnvNames) {
    if (!name.startsWith("VITE_") && !name.startsWith("PUBLIC_")) {
      issues.push(`Public env ${name} should use a VITE_ or PUBLIC_ prefix.`);
    }
  }
  return issues;
}

const issues = checkEnv();
if (issues.length > 0) {
  console.error("Stylyf env preflight failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log("Stylyf env preflight passed.");
}
