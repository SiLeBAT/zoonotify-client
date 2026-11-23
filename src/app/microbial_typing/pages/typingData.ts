import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { TYPING_RESULTS } from "../../shared/infrastructure/router/routes";

/** Strapi v5 returns `documentId` with every populated relation; it is the
 * same in both locales, so filter selections survive a language switch. */
type Relation = { name: string; documentId?: string } | null;

/**
 * One row of the CMS `typing-result` collection: the isolates of one typing
 * subgroup (e.g. a Salmonella serovar) in one combination and sampling year.
 */
export interface TypingResult {
    samplingYear: number;
    /** All isolates typed in the combination: its N. */
    numberOfIsolates: number;
    numberOfIsolatesInSubgroup: number;
    superCategorySampleOrigin?: Relation;
    sampleOrigin?: Relation;
    samplingStage?: Relation;
    matrixGroup?: Relation;
    matrix?: Relation;
    typingSubgroup?: Relation;
}

/**
 * The one seam for typing data: every row of one microorganism, in one locale,
 * with its relations populated. Rejects on a non-200 answer (e.g. the Public
 * role lacks `find` on `typing-result`).
 */
export async function fetchTypingResults(
    microorganism: string,
    locale: string
): Promise<TypingResult[]> {
    const url =
        `${TYPING_RESULTS}?locale=${locale}` +
        `&filters[microorganism][name][$eq]=${encodeURIComponent(
            microorganism
        )}` +
        `&populate[superCategorySampleOrigin][fields][0]=name` +
        `&populate[sampleOrigin][fields][0]=name` +
        `&populate[samplingStage][fields][0]=name` +
        `&populate[matrixGroup][fields][0]=name` +
        `&populate[matrix][fields][0]=name` +
        `&populate[typingSubgroup][fields][0]=name` +
        `&pagination[pageSize]=8000`;
    const res = await callApiService<{ data?: TypingResult[] }>(url);
    if (res.status !== 200) {
        throw new Error(`typing-results request failed: ${res.status}`);
    }
    return res.data?.data ?? [];
}

/** The sampling years present in the rows, newest first. */
export function samplingYears(rows: TypingResult[]): number[] {
    return Array.from(new Set(rows.map((r) => r.samplingYear))).sort(
        (a, b) => b - a
    );
}
