import type { TestInfo } from "@playwright/test";

/**
 * How a release test tells the reporter (and the sync check) which release
 * check it decides. Annotations travel with each result, so the reporter needs
 * no knowledge of file names or titles.
 */
export const CHECK_ANNOTATION = "release-check";
export const PARAMS_ANNOTATION = "release-check-params";
export const OUTCOME_ANNOTATION = "release-outcome";

export type Annotation = { type: string; description: string };

/**
 * Declares the release check a test decides. Pass the result as the test's
 * `annotation` detail, with the ID as a string literal (the sync check reads it
 * statically):
 *
 *     test("...", { annotation: releaseCheck("amr.filter", { organism: "SALM" }) }, ...)
 *
 * `params` tell parameterised checks apart in the report ("organism=SALM,view=substance").
 */
export function releaseCheck(
    id: string,
    params?: Record<string, string>
): Annotation[] {
    const annotations = [{ type: CHECK_ANNOTATION, description: id }];
    const entries = Object.entries(params ?? {});
    if (entries.length > 0) {
        annotations.push({
            type: PARAMS_ANNOTATION,
            description: entries.map(([k, v]) => `${k}=${v}`).join(","),
        });
    }
    return annotations;
}

/**
 * Outcomes a passing test can still flag. A failing test is simply "fail";
 * these two keep the test green but tell the reporter the check was not a plain pass.
 */
export type FlaggedOutcome = "could-not-verify" | "skipped-no-data";

/**
 * Records a flagged outcome as an `OUTCOME_ANNOTATION` annotation whose
 * description is `<outcome>: <detail>`. May be called several times per test;
 * the reporter reads them all.
 */
export function reportOutcome(
    testInfo: TestInfo,
    outcome: FlaggedOutcome,
    detail: string
): void {
    testInfo.annotations.push({
        type: OUTCOME_ANNOTATION,
        description: `${outcome}: ${detail}`,
    });
}
