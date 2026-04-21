#!/usr/bin/env node

import { runCli } from "./index.ts";

process.exitCode = runCli(process.argv.slice(2));
