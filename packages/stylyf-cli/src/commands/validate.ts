import { readSpecV10 } from "../spec/read.js";

export async function runValidateCommand(args: string[]) {
  let specPath: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--spec") {
      specPath = args[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--ir" || arg === "--print-resolved" || arg === "--write-resolved") {
      process.stderr.write(
        "Stylyf v1.0 no longer accepts --ir fragments. Use --spec stylyf.spec.json. Run `stylyf intro --topic spec` for the v1.0 DSL.\n",
      );
      return 1;
    }
  }

  if (!specPath) {
    process.stderr.write("Missing required option: --spec <path>\n");
    return 1;
  }

  const { path, spec } = await readSpecV10(specPath);

  process.stdout.write(
    [
      `Spec validation passed`,
      `  path: ${path}`,
      `  version: ${spec.version}`,
      `  kind: ${spec.app.kind}`,
      `  backend: ${spec.backend.mode}`,
      `  objects: ${spec.objects?.length ?? 0}`,
      `  flows: ${spec.flows?.length ?? 0}`,
      `  surfaces: ${spec.surfaces?.length ?? 0}`,
    ]
      .join("\n") + "\n",
  );
  return 0;
}
