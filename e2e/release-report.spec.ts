import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { TestCase, TestResult } from "@playwright/test/reporter";
import {
    CHECK_ANNOTATION,
    OUTCOME_ANNOTATION,
    PARAMS_ANNOTATION,
    releaseCheck,
} from "./release/support/annotations";
import ReleaseReporter from "./release/support/reporter";
import {
    buildReport,
    formatDataStatus,
    runUrl,
    type ReportHeader,
    type TestRecord,
} from "./release/support/report";

/**
 * The release report's rules, fed synthetic results. Runs in the CMS-free
 * sweep, like the rest of the harness's own tests.
 */

const header: ReportHeader = {
    target: "qa",
    baseUrl: "https://zoonotify-dev.bfr.berlin",
    clientCommit: "abc1234",
    cmsVersion: "5.2.0",
    cmsCommit: "def5678",
    dataStatus: "23.10.2026",
    runUrl: "https://github.com/SiLeBAT/zoonotify/actions/runs/42",
};

function record(
    status: TestRecord["status"],
    annotations: TestRecord["annotations"],
    extra: Partial<TestRecord> = {}
): TestRecord {
    return { title: "a test", tags: [], status, annotations, ...extra };
}

test.describe("buildReport", () => {
    test("writes the header", () => {
        expect(buildReport(header, [])).toBe(
            [
                "# Release report",
                "",
                "-   Target: qa (https://zoonotify-dev.bfr.berlin)",
                "-   Client commit: abc1234",
                "-   CMS: version 5.2.0, commit def5678",
                "-   Data status: 23.10.2026",
                "-   Run: https://github.com/SiLeBAT/zoonotify/actions/runs/42",
                "",
                "No release checks ran.",
                "",
            ].join("\n")
        );
    });

    test("says so when a header value is unknown", () => {
        const report = buildReport(
            {
                ...header,
                clientCommit: null,
                cmsVersion: null,
                cmsCommit: null,
                dataStatus: null,
                runUrl: null,
            },
            []
        );
        expect(report).toContain("-   Client commit: unknown");
        expect(report).toContain("-   CMS: unknown");
        expect(report).toContain("-   Data status: unknown");
        expect(report).toContain("-   Run: local run");
    });

    test("one row per check with all four outcomes", () => {
        const report = buildReport(header, [
            record("passed", releaseCheck("footer.links")),
            record("failed", releaseCheck("welcome.links"), {
                error: "Expected 3\nReceived 2",
            }),
            record("passed", [
                ...releaseCheck("explanation.cut-off-table"),
                {
                    type: OUTCOME_ANNOTATION,
                    description: "could-not-verify: example.org timed out",
                },
            ]),
            record("passed", [
                ...releaseCheck("amr.trend-info-button"),
                {
                    type: OUTCOME_ANNOTATION,
                    description: "skipped-no-data: Coming soon",
                },
            ]),
        ]);
        expect(report).toContain(
            [
                "| Check | Parameters | Outcome | Note |",
                "| ----- | ---------- | ------- | ---- |",
                "| `footer.links` |  | pass |  |",
                "| `welcome.links` |  | fail | Expected 3 |",
                "| `explanation.cut-off-table` |  | could not verify | example.org timed out |",
                "| `amr.trend-info-button` |  | skipped (no data) | Coming soon |",
            ].join("\n")
        );
    });

    test("a pass after a retry says so", () => {
        const report = buildReport(header, [
            record("flaky", releaseCheck("footer.links")),
        ]);
        expect(report).toContain(
            "| `footer.links` |  | pass (passed on retry) |  |"
        );
    });

    test("shows parameters, one row per parameter set", () => {
        const report = buildReport(header, [
            record("passed", releaseCheck("footer.links", { lang: "de" })),
            record("failed", releaseCheck("footer.links", { lang: "en" })),
        ]);
        expect(report).toContain("| `footer.links` | lang=de | pass |  |");
        expect(report).toContain("| `footer.links` | lang=en | fail |  |");
    });

    test("tests sharing a check and parameters report the worst outcome", () => {
        const report = buildReport(header, [
            record("passed", releaseCheck("footer.links")),
            record("failed", releaseCheck("footer.links")),
        ]);
        expect(report).toContain("| `footer.links` |  | fail |  |");
        expect(report.match(/footer\.links/g)).toHaveLength(1);
    });

    test("a plain skipped test reads skipped", () => {
        const report = buildReport(header, [
            record("skipped", releaseCheck("footer.links")),
        ]);
        expect(report).toContain("| `footer.links` |  | skipped |  |");
    });

    test("smoke results are one line and unannotated tests are not listed", () => {
        const report = buildReport(header, [
            record("passed", [], { tags: ["@smoke"] }),
            record("passed", [], { tags: ["@smoke"] }),
            record("failed", [], { tags: ["@smoke"] }),
            record("passed", []),
            record("passed", releaseCheck("footer.links")),
        ]);
        expect(report).toContain("Smoke: 2 passed, 1 failed.");
        expect(report).not.toContain("a test");
        expect(report.match(/\n\| `/g)).toHaveLength(1);
    });

    test("escapes table breakers in notes", () => {
        const report = buildReport(header, [
            record("passed", [
                ...releaseCheck("footer.links"),
                {
                    type: OUTCOME_ANNOTATION,
                    description: "could-not-verify: a | b",
                },
            ]),
        ]);
        expect(report).toContain("a \\| b");
    });

    test("never assigns a severity colour", () => {
        const report = buildReport(header, [
            record("passed", releaseCheck("a.b")),
            record("failed", releaseCheck("c.d")),
            record("flaky", releaseCheck("e.f")),
        ]);
        expect(report).not.toMatch(
            /\p{Extended_Pictographic}|\b(red|green|amber|yellow|orange)\b/iu
        );
    });

    test("ignores unrelated annotation types", () => {
        const report = buildReport(header, [
            record("passed", [
                ...releaseCheck("footer.links"),
                { type: "issue", description: "#1" },
            ]),
        ]);
        expect(report).toContain("| `footer.links` |  | pass |  |");
        expect(CHECK_ANNOTATION).toBe("release-check");
        expect(PARAMS_ANNOTATION).toBe("release-check-params");
    });
});

test.describe("header helpers", () => {
    test("formatDataStatus reads the import timestamp like the client", () => {
        expect(formatDataStatus("2026-10-23T12:00:00.000Z")).toMatch(
            /^2[23]\.10\.2026$/
        );
        expect(formatDataStatus(undefined)).toBeNull();
        expect(formatDataStatus("not a date")).toBeNull();
    });

    test("runUrl comes from the GitHub Actions environment", () => {
        expect(
            runUrl({
                GITHUB_SERVER_URL: "https://github.com",
                GITHUB_REPOSITORY: "SiLeBAT/zoonotify",
                GITHUB_RUN_ID: "42",
            })
        ).toBe("https://github.com/SiLeBAT/zoonotify/actions/runs/42");
        expect(runUrl({})).toBeNull();
    });
});

test.describe("ReleaseReporter", () => {
    function fakeTest(
        id: string,
        project: string,
        title: string,
        tags: string[]
    ): TestCase {
        return {
            id,
            title,
            tags,
            parent: { project: () => ({ name: project }) },
            outcome: () => "expected",
        } as unknown as TestCase;
    }

    function fakeResult(annotations: TestResult["annotations"]): TestResult {
        return { annotations } as unknown as TestResult;
    }

    test("counts @smoke tests from the chromium project in the Smoke line", async () => {
        const outputFile = path.join(
            mkdtempSync(path.join(tmpdir(), "release-report-")),
            "report.md"
        );
        const reporter = new ReleaseReporter({ outputFile });
        reporter.onTestEnd(
            fakeTest("1", "release", "a check", []),
            fakeResult(releaseCheck("footer.links"))
        );
        reporter.onTestEnd(
            fakeTest("2", "chromium", "@smoke boots", ["@smoke"]),
            fakeResult([])
        );
        reporter.onTestEnd(
            fakeTest("3", "chromium", "not smoke", []),
            fakeResult([])
        );
        await reporter.onEnd({ status: "passed" } as never);

        const report = readFileSync(outputFile, "utf8");
        expect(report).toContain("Smoke: 1 passed.");
        expect(report).toContain("`footer.links`");
    });

    test("a run without release projects writes no report", async () => {
        const outputFile = path.join(
            mkdtempSync(path.join(tmpdir(), "release-report-")),
            "report.md"
        );
        const reporter = new ReleaseReporter({ outputFile });
        reporter.onTestEnd(
            fakeTest("2", "chromium", "@smoke boots", ["@smoke"]),
            fakeResult([])
        );
        await reporter.onEnd({ status: "passed" } as never);
        expect(() => readFileSync(outputFile, "utf8")).toThrow();
    });
});
