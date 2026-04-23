import { resolve } from "node:path";
import { generateFrontendDraft } from "../generators/generate.js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { composeAppIrFromPaths } from "../ir/compose.js";

export async function runGenerateCommand(args: string[]) {
  const irPaths: string[] = [];
  let targetPath: string | undefined;
  let resolvedOutputPath: string | undefined;
  let install = true;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--ir") {
      const value = args[index + 1];
      if (value) {
        irPaths.push(value);
        index += 1;
      }
      continue;
    }

    if (arg === "--target") {
      targetPath = args[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--write-resolved") {
      resolvedOutputPath = args[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--no-install") {
      install = false;
    }
  }

  if (irPaths.length === 0) {
    process.stderr.write("Missing required option: --ir <path> (repeatable)\n");
    return 1;
  }

  if (!targetPath) {
    process.stderr.write("Missing required option: --target <path>\n");
    return 1;
  }

  const resolvedTargetPath = resolve(process.cwd(), targetPath);
  const result = await generateFrontendDraft(irPaths, resolvedTargetPath, { install });

  if (resolvedOutputPath) {
    const { app } = await composeAppIrFromPaths(irPaths);
    const resolvedPath = resolve(process.cwd(), resolvedOutputPath);
    await mkdir(dirname(resolvedPath), { recursive: true });
    await writeFile(resolvedPath, `${JSON.stringify(app, null, 2)}\n`);
  }

  process.stdout.write(
    [
      `Generated frontend draft in ${resolvedTargetPath}`,
      `  ir fragments: ${irPaths.length}`,
      `  routes: ${result.routes}`,
      `  app shells: ${result.appShells}`,
      `  page shells: ${result.pageShells}`,
      `  layouts: ${result.layouts}`,
      `  api routes: ${result.apiRoutes}`,
      `  server modules: ${result.serverModules}`,
      `  copied source files: ${result.copiedFiles}`,
      `  post-generate steps: ${
        result.postGenerateSteps.length > 0 ? result.postGenerateSteps.join(", ") : install ? "none" : "skipped"
      }`,
      `  npm install: ${result.installed ? "completed" : "skipped"}`,
      resolvedOutputPath ? `  resolved ir: ${resolve(process.cwd(), resolvedOutputPath)}` : undefined,
    ]
      .filter(Boolean)
      .join("\n") + "\n",
  );

  return 0;
}
