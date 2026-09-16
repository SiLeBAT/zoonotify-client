#!/usr/bin/env node
/**
 * Type-checks the e2e suite, ignoring errors inside node_modules.
 *
 * Playwright's types reach `zod`, whose .d.cts uses syntax TypeScript 4.9.5
 * (what this repo pins) cannot parse. Those are *syntax* errors, so
 * `skipLibCheck` does not silence them and plain `tsc -p e2e/tsconfig.json`
 * always exits non-zero however clean our own code is. Filtering by path keeps
 * the check meaningful until the repo moves to TypeScript 5.
 */
import { spawn } from "node:child_process";

const tsc = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["tsc", "--noEmit", "-p", "e2e/tsconfig.json"],
    { shell: process.platform === "win32" }
);

let output = "";
tsc.stdout.on("data", (chunk) => (output += chunk));
tsc.stderr.on("data", (chunk) => (output += chunk));

tsc.on("close", () => {
    const ours = output
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")
        .filter((line) => !/^node_modules[\/]/.test(line));

    if (ours.length === 0) {
        console.log("e2e typecheck: clean");
        process.exit(0);
    }

    console.error(ours.join("\n"));
    process.exit(1);
});
