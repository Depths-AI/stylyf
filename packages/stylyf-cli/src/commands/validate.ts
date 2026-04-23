import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { composeAppIrFromPaths } from "../ir/compose.js";

export async function runValidateCommand(args: string[]) {
  const irPaths: string[] = [];
  let printResolved = false;
  let resolvedOutputPath: string | undefined;

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

    if (arg === "--print-resolved") {
      printResolved = true;
      continue;
    }

    if (arg === "--write-resolved") {
      resolvedOutputPath = args[index + 1];
      index += 1;
    }
  }

  if (irPaths.length === 0) {
    process.stderr.write("Missing required option: --ir <path> (repeatable)\n");
    return 1;
  }

  const { app } = await composeAppIrFromPaths(irPaths);

  if (printResolved) {
    process.stdout.write(`${JSON.stringify(app, null, 2)}\n`);
  }

  if (resolvedOutputPath) {
    const resolvedPath = resolve(process.cwd(), resolvedOutputPath);
    await mkdir(dirname(resolvedPath), { recursive: true });
    await writeFile(resolvedPath, `${JSON.stringify(app, null, 2)}\n`);
  }

  process.stdout.write(
    [
      `IR validation passed`,
      `  ir fragments: ${irPaths.length}`,
      `  routes: ${app.routes.length}`,
      `  resources: ${app.resources?.length ?? 0}`,
      `  workflows: ${app.workflows?.length ?? 0}`,
      resolvedOutputPath ? `  resolved ir: ${resolve(process.cwd(), resolvedOutputPath)}` : undefined,
    ]
      .filter(Boolean)
      .join("\n") + "\n",
  );
  return 0;
}
