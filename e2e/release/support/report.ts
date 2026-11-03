import {
    CHECK_ANNOTATION,
    OUTCOME_ANNOTATION,
    PARAMS_ANNOTATION,
    type Annotation,
} from "./annotations";

/**
 * The release report: what an RC or post-release run hands to the sign-off.
 * Pure functions from synthetic-friendly records to Markdown, so the rules are
 * unit-tested without a Playwright run. The report states outcomes only; it
 * never ranks or colours them.
 */

export interface ReportHeader {
    target: string | null;
    baseUrl: string | null;
    clientCommit: string | null;
    cmsVersion: string | null;
    cmsCommit: string | null;
    /** DD.MM.YYYY, as the figures show it. */
    dataStatus: string | null;
    runUrl: string | null;
}

/** One finished test, reduced to what the report reads. */
export interface TestRecord {
    title: string;
    tags: string[];
    /** `flaky` is Playwright's word for passed on a retry. */
    status: "passed" | "failed" | "flaky" | "skipped";
    annotations: Annotation[];
    /** First error message of the failing attempt, if any. */
    error?: string;
}

type CheckOutcome =
    | "pass"
    | "pass (passed on retry)"
    | "fail"
    | "could not verify"
    | "skipped (no data)"
    | "skipped";

/** Only used to pick which outcome a row shared by several tests shows. */
const PRECEDENCE: CheckOutcome[] = [
    "fail",
    "could not verify",
    "skipped (no data)",
    "skipped",
    "pass (passed on retry)",
    "pass",
];

const FLAGGED_LABEL: Record<string, CheckOutcome> = {
    "could-not-verify": "could not verify",
    "skipped-no-data": "skipped (no data)",
};

interface Row {
    id: string;
    params: string;
    outcome: CheckOutcome;
    notes: string[];
}

function annotationValues(record: TestRecord, type: string): string[] {
    return record.annotations
        .filter((a) => a.type === type)
        .map((a) => a.description);
}

function pick(outcomes: CheckOutcome[]): CheckOutcome {
    return PRECEDENCE.find((o) => outcomes.includes(o)) ?? "pass";
}

function classify(record: TestRecord): {
    outcome: CheckOutcome;
    notes: string[];
} {
    if (record.status === "failed") {
        const firstLine = record.error?.split(/\r?\n/)[0]?.trim();
        return { outcome: "fail", notes: firstLine ? [firstLine] : [] };
    }

    const flagged = annotationValues(record, OUTCOME_ANNOTATION)
        .map((value) => {
            const at = value.indexOf(":");
            const key = (at === -1 ? value : value.slice(0, at)).trim();
            const detail = at === -1 ? "" : value.slice(at + 1).trim();
            return { outcome: FLAGGED_LABEL[key], detail };
        })
        .filter(
            (f): f is { outcome: CheckOutcome; detail: string } => !!f.outcome
        );
    if (flagged.length > 0) {
        const outcome = pick(flagged.map((f) => f.outcome));
        return {
            outcome,
            notes: flagged
                .filter((f) => f.outcome === outcome && f.detail)
                .map((f) => f.detail),
        };
    }

    if (record.status === "skipped") return { outcome: "skipped", notes: [] };
    if (record.status === "flaky") {
        return { outcome: "pass (passed on retry)", notes: [] };
    }
    return { outcome: "pass", notes: [] };
}

function cell(text: string): string {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/\|/g, "\\|")
        .replace(/\s*\r?\n\s*/g, " ");
}

function rowsOf(records: TestRecord[]): Row[] {
    const rows = new Map<string, Row>();
    for (const record of records) {
        const id = annotationValues(record, CHECK_ANNOTATION)[0];
        if (!id) continue;
        const params = annotationValues(record, PARAMS_ANNOTATION).join(",");
        const { outcome, notes } = classify(record);
        const key = `${id}\u0000${params}`;
        const row = rows.get(key);
        if (!row) {
            rows.set(key, { id, params, outcome, notes });
        } else {
            const combined = pick([row.outcome, outcome]);
            row.notes = [
                ...(row.outcome === combined ? row.notes : []),
                ...(outcome === combined ? notes : []),
            ];
            row.outcome = combined;
        }
    }
    return [...rows.values()];
}

function smokeLine(records: TestRecord[]): string | null {
    const smoke = records.filter((r) => r.tags.includes("@smoke"));
    if (smoke.length === 0) return null;
    const count = (statuses: TestRecord["status"][]): number =>
        smoke.filter((r) => statuses.includes(r.status)).length;
    const parts: Array<[number, string]> = [
        [count(["passed", "flaky"]), "passed"],
        [count(["failed"]), "failed"],
        [count(["skipped"]), "skipped"],
    ];
    return `Smoke: ${parts
        .filter(([n]) => n !== 0)
        .map(([n, label]) => `${n} ${label}`)
        .join(", ")}.`;
}

export function buildReport(
    header: ReportHeader,
    records: TestRecord[]
): string {
    const unknown = (value: string | null): string => value ?? "unknown";
    const cms =
        header.cmsVersion || header.cmsCommit
            ? [
                  header.cmsVersion && `version ${header.cmsVersion}`,
                  header.cmsCommit && `commit ${header.cmsCommit}`,
              ]
                  .filter(Boolean)
                  .join(", ")
            : "unknown";
    const target = header.target
        ? header.baseUrl
            ? `${header.target} (${header.baseUrl})`
            : header.target
        : unknown(header.baseUrl);

    const lines = [
        "# Release report",
        "",
        `-   Target: ${target}`,
        `-   Client commit: ${unknown(header.clientCommit)}`,
        `-   CMS: ${cms}`,
        `-   Data status: ${unknown(header.dataStatus)}`,
        `-   Run: ${header.runUrl ?? "local run"}`,
        "",
    ];

    const rows = rowsOf(records);
    if (rows.length === 0) {
        lines.push("No release checks ran.", "");
    } else {
        lines.push(
            "| Check | Parameters | Outcome | Note |",
            "| ----- | ---------- | ------- | ---- |",
            ...rows.map(
                (r) =>
                    `| \`${r.id}\` | ${cell(r.params)} | ${r.outcome} | ${cell(
                        r.notes.join("; ")
                    )} |`
            ),
            ""
        );
    }

    const smoke = smokeLine(records);
    if (smoke) lines.push(smoke, "");

    return lines.join("\n");
}

/** DD.MM.YYYY of an ISO timestamp, as `formatDataUpdateDate` in the client does; null if unusable. */
export function formatDataStatus(iso: string | undefined): string | null {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}.${date.getFullYear()}`;
}

/** The GitHub Actions run URL, or null outside Actions. */
export function runUrl(env: Record<string, string | undefined>): string | null {
    const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = env;
    if (!GITHUB_SERVER_URL || !GITHUB_REPOSITORY || !GITHUB_RUN_ID) return null;
    return `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
}
