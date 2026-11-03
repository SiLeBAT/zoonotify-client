import { APIRequestContext } from "@playwright/test";
import { apiGetAll, Locale, PAGE_SIZE } from "./oracle";

/** A related record as `/api/prevalences` returns it. */
export interface Related {
    documentId: string;
    name: string;
}

/** One `/api/prevalences` row; relations are present only when populated. */
export interface PrevalenceItem {
    samplingYear?: number | null;
    numberOfSamples?: number | null;
    numberOfPositive?: number | null;
    percentageOfPositive?: number | null;
    ciMin?: number | null;
    ciMax?: number | null;
    microorganism?: Related | null;
    superCategorySampleOrigin?: Related | null;
    sampleOrigin?: Related | null;
    samplingStage?: Related | null;
    matrixGroup?: Related | null;
    matrix?: Related | null;
}

export type PrevalenceRelation =
    | "microorganism"
    | "superCategorySampleOrigin"
    | "sampleOrigin"
    | "samplingStage"
    | "matrixGroup"
    | "matrix";

/** Every relation the filters and the download read. */
export const ALL_RELATIONS: readonly PrevalenceRelation[] = [
    "microorganism",
    "superCategorySampleOrigin",
    "sampleOrigin",
    "samplingStage",
    "matrixGroup",
    "matrix",
];

/** The one place a `populate` query string is built. */
export function populate(relations: readonly string[]): string {
    return relations.map((relation) => `populate=${relation}`).join("&");
}

/**
 * All prevalence rows in a locale, as the client fetches them (one page, with
 * the truncation guard). `query` appends further parameters, e.g. a filter.
 */
export function loadPrevalenceItems(
    request: APIRequestContext,
    locale: Locale,
    relations: readonly PrevalenceRelation[] = ALL_RELATIONS,
    query = ""
): Promise<PrevalenceItem[]> {
    return apiGetAll<PrevalenceItem>(
        request,
        `/prevalences?${populate(relations)}${query ? `&${query}` : ""}`,
        PAGE_SIZE.prevalence,
        locale
    );
}
