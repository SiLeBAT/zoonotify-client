import { APIRequestContext, expect, Locator, Page } from "@playwright/test";
import amrEn from "../../../src/locales/en/Antibiotic.json";
import { apiGetAll, normalise, PAGE_SIZE } from "./oracle";

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

/** The microorganism filter the client sends (`buildMicroorganismFilter`). */
export function organismFilter(organism: string): string {
    const enc = encodeURIComponent;
    if (organism === "ESBL/AmpC E. coli") {
        return `filters[microorganism][name][$containsi]=${enc("ESBL")}`;
    }
    if (organism === "Enterococcus spp.") {
        return `filters[microorganism][name][$containsi]=${enc(
            "Enterococcus"
        )}`;
    }
    if (organism === "MRSA" || organism === "STEC") {
        return `filters[microorganism][name][$containsi]=${enc(
            `(${organism})`
        )}`;
    }
    return `filters[microorganism][name][$eq]=${enc(organism)}`;
}

/** The same request the page sends for its filter options, with the truncation guard. */
export function resistanceRows(
    request: APIRequestContext,
    organism: string
): Promise<ResistanceRow[]> {
    return apiGetAll(
        request,
        `/resistances?${organismFilter(organism)}&populate=*`,
        PAGE_SIZE.resistances,
        "en"
    );
}

/** Names a dropdown should list: the distinct, whitespace-normalised names. */
export function facet(rows: ResistanceRow[], key: FilterKey): string[] {
    const names = new Set<string>();
    for (const row of rows) {
        const rel = row[key];
        if (rel?.documentId && rel.name) names.add(normalise(rel.name));
    }
    return [...names].sort();
}

/** Rows whose `key` relation is one of `names` (the cascade's input). */
export function where(
    rows: ResistanceRow[],
    key: FilterKey,
    names: string[]
): ResistanceRow[] {
    return rows.filter((row) => {
        const rel = row[key];
        return !!rel && names.includes(normalise(rel.name));
    });
}

/**
 * A select by accessible name. MUI appends the selected value to the name, so
 * match the label as a prefix; a label that is itself the start of another one
 * ("Matrix" / "Matrix Group") must not match the longer one.
 */
export function dropdown(page: Page, key: FilterKey): Locator {
    const label = FILTER_LABELS[key];
    const longer = Object.values(FILTER_LABELS)
        .filter((other) => other.startsWith(`${label} `))
        .map((other) => other.slice(label.length + 1));
    const exclude = longer.length > 0 ? `(?!\\s(?:${longer.join("|")}))` : "";
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return page.getByRole("combobox", {
        name: new RegExp(`^${escaped}${exclude}(\\s|$)`),
    });
}

/** Opens a dropdown, reads its options (without Select All) and closes it. */
export async function optionNames(
    page: Page,
    key: FilterKey
): Promise<string[]> {
    await dropdown(page, key).click();
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    const names = (await listbox.getByRole("option").allInnerTexts())
        .map(normalise)
        .filter(
            (name) => name !== amrEn.SELECT_ALL && name !== amrEn.DESELECT_ALL
        );
    await page.keyboard.press("Escape");
    await expect(listbox).toBeHidden();
    return names.sort();
}
