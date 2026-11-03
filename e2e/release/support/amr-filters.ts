import { APIRequestContext, Locator, Page } from "@playwright/test";
import { buildMicroorganismFilter } from "../../../src/app/antibiotic_resistance/pages/resistanceHelpers";
import amrEn from "../../../src/locales/en/Antibiotic.json";
import { apiGetAll, Locale, normalise, PAGE_SIZE } from "./oracle";
import { closeSelect, comboboxByLabel, readOptions } from "./select";

/**
 * Oracle and page helpers for the AMR release checks. The filter options are
 * derived from the rows `/api/resistances` returns for one organism, so the
 * expected option lists are computed from those same rows, live.
 */

export type Rel = { documentId: string; name: string } | null;

export interface ResistanceRow {
    specie: Rel;
    superCategorySampleOrigin: Rel;
    sampleOrigin: Rel;
    samplingStage: Rel;
    matrixGroup: Rel;
    matrix: Rel;
    antimicrobialSubstance: Rel;
}

export type FilterKey = keyof ResistanceRow;

/** The organisms the AMR page lists (`ORGANISMS` in the page component). */
export const ORGANISMS = [
    "E. coli",
    "ESBL/AmpC E. coli",
    "Campylobacter spp.",
    "Salmonella spp.",
    "MRSA",
    "STEC",
    "Enterococcus spp.",
] as const;

export const VIEWS = ["trend", "substance"] as const;
export type View = (typeof VIEWS)[number];

/** Filter dropdowns and their English labels, in page order. */
export const FILTER_LABELS: Record<FilterKey, string> = {
    specie: amrEn.SPECIES,
    superCategorySampleOrigin: amrEn["SUPER-CATEGORY-SAMPLE-ORIGIN"],
    sampleOrigin: amrEn.SAMPLE_ORIGIN,
    samplingStage: amrEn.SAMPLING_STAGE,
    matrixGroup: amrEn.MATRIX_GROUP,
    matrix: amrEn.MATRIX,
    antimicrobialSubstance: amrEn.ANTIBIOTIC_SUBSTANCE,
};

/** Campylobacter and Enterococcus are the only organisms with a species filter. */
export function filterKeys(organism: string): FilterKey[] {
    const keys = Object.keys(FILTER_LABELS) as FilterKey[];
    const hasSpecies =
        organism === "Campylobacter spp." || organism === "Enterococcus spp.";
    return keys.filter((key) => key !== "specie" || hasSpecies);
}

/** The same request the page sends for its filter options, with the truncation guard. */
export function resistanceRows(
    request: APIRequestContext,
    organism: string,
    locale: Locale = "en"
): Promise<ResistanceRow[]> {
    return apiGetAll<ResistanceRow>(
        request,
        `/resistances?populate=*${buildMicroorganismFilter(organism)}`,
        PAGE_SIZE.resistances,
        locale
    );
}

/** Names a dropdown should list: the distinct, whitespace-normalised names. */
export function facetNames(rows: ResistanceRow[], key: FilterKey): string[] {
    const names = new Set<string>();
    for (const row of rows) {
        const rel = row[key];
        if (rel?.documentId && rel.name) names.add(normalise(rel.name));
    }
    return [...names].sort();
}

/** Rows whose `key` relation is one of `names` (the cascade's input). */
export function rowsWhere(
    rows: ResistanceRow[],
    key: FilterKey,
    names: string[]
): ResistanceRow[] {
    return rows.filter((row) => {
        const rel = row[key];
        return !!rel && names.includes(normalise(rel.name));
    });
}

/** The filter dropdown for `key`; "Matrix" must not match "Matrix Group". */
export function filterDropdown(page: Page, key: FilterKey): Locator {
    return comboboxByLabel(
        page,
        FILTER_LABELS[key],
        Object.values(FILTER_LABELS)
    );
}

/** Opens a dropdown, reads its options (without Select All) and closes it. */
export async function dropdownOptionNames(
    page: Page,
    key: FilterKey
): Promise<string[]> {
    const names = (await readOptions(page, filterDropdown(page, key))).filter(
        (name) => name !== amrEn.SELECT_ALL && name !== amrEn.DESELECT_ALL
    );
    await closeSelect(page);
    return names.sort();
}
