import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * The release checks list (`e2e/release/release-checks.md`) and the sync check
 * between it and the annotated tests. Pure functions over text, so the sync
 * check itself is testable; `loadChecksList` / `loadAnnotations` read the repo.
 *
 * A list row's Test column is one of:
 *   `e2e/release/<file>.spec.ts`  the automated check (must carry the annotation)
 *   `manual`                      a human judgement (an annotated test is allowed, e.g. evidence)
 *   `pending #NNN`                not built yet: ticket NNN replaces it with the file
 */
export interface CheckRow {
    id: string;
    test: string;
}

const RELEASE_DIR = join(__dirname, "..");
export const CHECKS_LIST_PATH = join(RELEASE_DIR, "release-checks.md");

export function parseChecksList(markdown: string): CheckRow[] {
    const rows: CheckRow[] = [];
    let testColumn = -1;
    for (const line of markdown.split(/\r?\n/)) {
        if (!line.trim().startsWith("|")) continue;
        const cells = line
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim().replace(/`/g, ""));
        if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
        if (cells[0] === "ID") {
            testColumn = cells.indexOf("Test");
            continue;
        }
        if (testColumn < 0) continue;
        rows.push({ id: cells[0], test: cells[testColumn] });
    }
    return rows;
}

const CALL = /releaseCheck\(\s*["'`]([A-Za-z0-9._-]+)["'`]/g;

/** Maps each check ID to the files that annotate it, from `[file, source]` pairs. */
export function scanAnnotations(
    sources: Array<[file: string, source: string]>
): Map<string, string[]> {
    const found = new Map<string, string[]>();
    for (const [file, source] of sources) {
        for (const match of source.matchAll(CALL)) {
            const files = found.get(match[1]) ?? [];
            if (!files.includes(file)) files.push(file);
            found.set(match[1], files);
        }
    }
    return found;
}

/** Human-readable problems; empty when the list and the tests agree. */
export function syncProblems(
    rows: CheckRow[],
    annotated: Map<string, string[]>
): string[] {
    const problems: string[] = [];
    const seen = new Set<string>();
    for (const { id, test } of rows) {
        if (seen.has(id)) problems.push(`${id}: listed twice`);
        seen.add(id);
        const files = annotated.get(id) ?? [];
        if (test === "manual") continue;
        if (/^pending\b/.test(test)) {
            if (files.length > 0) {
                problems.push(
                    `${id}: annotated in ${files.join(
                        ", "
                    )} but still "${test}" on the list; name the test file`
                );
            }
            continue;
        }
        if (files.length === 0) {
            problems.push(
                `${id}: the list names ${test} but no test is annotated with it`
            );
        } else if (!files.includes(test)) {
            problems.push(
                `${id}: the list names ${test} but it is annotated in ${files.join(
                    ", "
                )}`
            );
        }
    }
    for (const id of annotated.keys()) {
        if (!seen.has(id)) {
            problems.push(
                `${id}: annotated in a test but not on the release checks list`
            );
        }
    }
    return problems;
}

export function loadChecksList(): CheckRow[] {
    return parseChecksList(readFileSync(CHECKS_LIST_PATH, "utf8"));
}

/** Annotated IDs across every release spec file; paths are relative to the client root. */
export function loadAnnotations(): Map<string, string[]> {
    const sources: Array<[string, string]> = [];
    const walk = (dir: string, rel: string): void => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const path = `${rel}/${entry.name}`;
            if (entry.isDirectory()) walk(join(dir, entry.name), path);
            else if (entry.name.endsWith(".spec.ts")) {
                sources.push([
                    path,
                    readFileSync(join(dir, entry.name), "utf8"),
                ]);
            }
        }
    };
    walk(RELEASE_DIR, "e2e/release");
    return scanAnnotations(sources);
}
