import { appendFileSync, writeFileSync } from "node:fs";
import type {
    FullResult,
    Reporter,
    TestCase,
    TestResult,
} from "@playwright/test/reporter";
import { CLIENT_COMMIT_ANNOTATION } from "./annotations";
import {
    buildReport,
    formatDataStatus,
    runUrl,
    type ReportHeader,
    type TestRecord,
} from "./report";

const STATUS: Record<ReturnType<TestCase["outcome"]>, TestRecord["status"]> = {
    expected: "passed",
    unexpected: "failed",
    flaky: "flaky",
    skipped: "skipped",
};

/** The release project and its setup; a run with neither is not a release run. */
const RELEASE_PROJECTS = ["release", "release-setup"];

/**
 * Writes the release report when a run is over: always to `release-report.md`
 * (the sign-off issue comment reuses it), and also appended to
 * `$GITHUB_STEP_SUMMARY` when set.
 * Only wired in for runs against a deployed site (see playwright.config.ts).
 */
export default class ReleaseReporter implements Reporter {
    private records = new Map<string, TestRecord>();
    private ranRelease = false;
    private servedCommit: string | null = null;

    private outputFile: string;

    constructor(options: { outputFile?: string } = {}) {
        this.outputFile = options.outputFile ?? "release-report.md";
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const inRelease = RELEASE_PROJECTS.includes(
            test.parent.project()?.name ?? ""
        );
        // The Smoke line counts @smoke tests wherever they run (they live in
        // the CMS-free chromium project); everything else is release-only.
        if (!inRelease && !test.tags.includes("@smoke")) return;
        if (inRelease) {
            this.ranRelease = true;
            const commit = result.annotations.find(
                (a) => a.type === CLIENT_COMMIT_ANNOTATION
            );
            if (commit) this.servedCommit = commit.description ?? null;
        }
        // Each attempt overwrites the last; the final one speaks for the test.
        this.records.set(test.id, {
            title: test.title,
            tags: test.tags,
            status: STATUS[test.outcome()],
            annotations: result.annotations.map((a) => ({
                type: a.type,
                description: a.description ?? "",
            })),
            // eslint-disable-next-line no-control-regex
            error: result.error?.message?.replace(/\u001b\[[0-9;]*m/g, ""),
        });
    }

    async onEnd(_result: FullResult): Promise<void> {
        if (!this.ranRelease) return;
        const header = await readHeader(process.env, this.servedCommit);
        const markdown = buildReport(header, [...this.records.values()]);
        const summary = process.env.GITHUB_STEP_SUMMARY;
        writeFileSync(this.outputFile, markdown);
        if (summary) appendFileSync(summary, markdown);
    }
}

/**
 * The header's facts. The CMS version and commit are response headers of any
 * API call; the data status date is the CMS's last recorded import. Anything
 * that cannot be read stays null and prints as unknown.
 */
export async function readHeader(
    env: Record<string, string | undefined>,
    servedCommit: string | null,
    fetchImpl: typeof fetch = fetch
): Promise<ReportHeader> {
    const baseUrl = env.E2E_BASE_URL ?? null;
    const header: ReportHeader = {
        target: env.E2E_TARGET ?? null,
        baseUrl,
        clientCommit: servedCommit ?? env.E2E_EXPECTED_COMMIT ?? null,
        cmsVersion: null,
        cmsCommit: null,
        dataStatus: null,
        runUrl: runUrl(env),
    };
    if (!baseUrl) return header;
    try {
        const response = await fetchImpl(`${baseUrl}/api/data-import`, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(15_000),
        });
        header.cmsVersion = response.headers.get("cms-version") || null;
        header.cmsCommit = response.headers.get("cms-commit") || null;
        if (response.ok) {
            const body = (await response.json()) as {
                data?: { completedAt?: string };
            };
            header.dataStatus = formatDataStatus(body.data?.completedAt);
        }
    } catch {
        // The report still goes out; the header says "unknown".
    }
    return header;
}
