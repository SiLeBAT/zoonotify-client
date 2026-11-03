import { APIRequestContext, expect, Locator, Page } from "@playwright/test";
import { Locale, normalise } from "./oracle";
import {
    ALL_RELATIONS,
    loadPrevalenceItems,
    PrevalenceItem,
    PrevalenceRelation,
} from "./prevalence-api";
import { chooseOption, closeSelect, readOptions } from "./select";

/**
 * Oracle and page helpers for the prevalence side filters (data filter and
 * reset checks). The oracle replicates the client's faceted cascade
 * (PrevalenceDataContext "Recompute Options Based on Selection") and its quirks
 * (PrevalenceSideContent): hidden E. coli / Enterococcus, a "Select all" row.
 */

export type Dimension =
    | "year"
    | "microorganism"
    | "superCategory"
    | "sampleOrigin"
    | "samplingStage"
    | "matrixGroup"
    | "matrix";

/** Dimensions in on-screen order, with the locale key and the element id of each select's label. */
export const DIMENSIONS: {
    dim: Dimension;
    labelKey: string;
    labelId: string;
}[] = [
    { dim: "year", labelKey: "SAMPLING_YEAR", labelId: "years-label" },
    {
        dim: "microorganism",
        labelKey: "MICROORGANISM",
        labelId: "microorganisms-label",
    },
    {
        dim: "superCategory",
        labelKey: "SUPER-CATEGORY-SAMPLE-ORIGIN",
        labelId: "superCategories-label",
    },
    {
        dim: "sampleOrigin",
        labelKey: "SAMPLE_ORIGIN",
        labelId: "sampleOrigins-label",
    },
    {
        dim: "samplingStage",
        labelKey: "SAMPLING_STAGE",
        labelId: "samplingStages-label",
    },
    {
        dim: "matrixGroup",
        labelKey: "MATRIX_GROUP",
        labelId: "matrixGroups-label",
    },
    { dim: "matrix", labelKey: "MATRIX", labelId: "matrices-label" },
];

/** API relation behind each dimension (year is a plain field). */
const RELATION: Record<Exclude<Dimension, "year">, PrevalenceRelation> = {
    microorganism: "microorganism",
    superCategory: "superCategorySampleOrigin",
    sampleOrigin: "sampleOrigin",
    samplingStage: "samplingStage",
    matrixGroup: "matrixGroup",
    matrix: "matrix",
};

/** One row reduced to what the filters see: a value (id or year) per dimension. */
export interface FacetRow {
    year: number;
    values: Partial<Record<Dimension, { id: string; name: string }>>;
}

/** Selected values per dimension (documentIds; the year as a string). */
export type Selection = Partial<Record<Dimension, string[]>>;

export interface FacetOption {
    id: string;
    name: string;
}

/** The same query the client sends for the full dataset. */
export async function loadFacetRows(
    request: APIRequestContext,
    locale: Locale
): Promise<FacetRow[]> {
    const items = await loadPrevalenceItems(request, locale, ALL_RELATIONS);
    return toFacetRows(items);
}

export function toFacetRows(items: PrevalenceItem[]): FacetRow[] {
    return items.map((item) => {
        const values: FacetRow["values"] = {
            year: {
                id: String(item.samplingYear),
                name: String(item.samplingYear),
            },
        };
        for (const [dim, relation] of Object.entries(RELATION) as [
            Exclude<Dimension, "year">,
            PrevalenceRelation
        ][]) {
            const rel = item[relation];
            // The client skips relations lacking an id or a name.
            if (rel?.documentId && rel?.name) {
                values[dim] = {
                    id: rel.documentId,
                    name: rel.name,
                };
            }
        }
        return { year: item.samplingYear ?? 0, values };
    });
}

/** Names the client never lists in the microorganism dropdown. */
export function isHiddenMicroorganism(name: string): boolean {
    return name === "E. coli" || name.startsWith("Enterococcus");
}

/**
 * Options of `dim` given `selection`: values that co-occur in some row with
 * every other dimension's selection (its own is ignored), as the client lists
 * them, including the hidden-microorganism quirk and its sort order.
 */
export function facetOptions(
    rows: FacetRow[],
    selection: Selection,
    dim: Dimension
): FacetOption[] {
    const matches = (row: FacetRow, other: Dimension): boolean => {
        const chosen = selection[other] ?? [];
        return (
            chosen.length === 0 || chosen.includes(row.values[other]?.id ?? "")
        );
    };
    const found = new Map<string, string>();
    for (const row of rows) {
        const ok = DIMENSIONS.every(
            ({ dim: other }) => other === dim || matches(row, other)
        );
        const value = row.values[dim];
        if (ok && value && !found.has(value.id))
            found.set(value.id, value.name);
    }
    let options = [...found].map(([id, name]) => ({ id, name }));
    if (dim === "microorganism") {
        options = options.filter((o) => !isHiddenMicroorganism(o.name));
    }
    if (dim === "year") {
        return options.sort((a, b) => Number(a.id) - Number(b.id));
    }
    return options.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Compares what a dropdown shows with what the oracle expects. Returns a
 * human-readable problem or null. Names are whitespace-normalised on both
 * sides. Order is checked separately, in the browser (see `expectFacet`): the
 * client sorts with the browser's own `localeCompare`, which Node does not share.
 */
export function compareOptions(
    expected: FacetOption[],
    shown: string[]
): string | null {
    const want = expected.map((o) => normalise(o.name));
    const got = shown.map(normalise);
    const missing = want.filter((n) => !got.includes(n));
    const extra = got.filter((n) => !want.includes(n));
    if (missing.length || extra.length) {
        return `missing ${JSON.stringify(missing)}, unexpected ${JSON.stringify(
            extra
        )}`;
    }
    return null;
}

/**
 * The select whose visible label has element id `labelId`. A name match cannot
 * tell "Matrix" from "Matrix group" ("Matrix" is a prefix of both, and MUI adds
 * the chosen values to the name), so the client's stable label ids are used.
 */
export function filterSelect(page: Page, labelId: string): Locator {
    return page.locator(`[role="combobox"][aria-labelledby~="${labelId}"]`);
}

/**
 * Opens a dropdown and returns its option texts without the "Select all" row,
 * which must be present (client quirk). Leaves the dropdown open.
 */
export async function openOptions(
    page: Page,
    select: Locator,
    selectAllLabels: string[]
): Promise<string[]> {
    const texts = await readOptions(page, select);
    expect(
        selectAllLabels,
        'the dropdown starts with a "Select all" row'
    ).toContain(texts[0]);
    // MUI also exposes the client's 4px spacer box between the two as an empty option.
    return texts.slice(1).filter((text) => text !== "");
}

/** URL query keys the client writes for filter state. */
export const FILTER_URL_PARAMS = [
    "microorganism",
    "sampleOrigin",
    "matrix",
    "samplingStage",
    "matrixGroup",
    "superCategorySampleOrigin",
    "samplingYear",
    "chartMicro",
];

type Labels = Record<string, string>;

/** The page's own labels for a language (from the locale JSON the client uses). */
export function selectAllLabels(labels: Labels): string[] {
    return [labels.SELECT_ALL, labels.DESELECT_ALL];
}

/** Opens the page and waits until the filters have rendered (data loaded). */
export async function openPrevalencePage(
    page: Page,
    lang: Locale,
    labels: Labels
): Promise<void> {
    await page.goto(`/prevalence?lang=${lang}`);
    await expect(filterSelect(page, "matrices-label")).toBeVisible({
        timeout: 60_000,
    });
}

function select(page: Page, labels: Labels, dim: Dimension): Locator {
    const entry = DIMENSIONS.find((d) => d.dim === dim)!;
    return filterSelect(page, entry.labelId);
}

/**
 * Opens `dim`'s dropdown, compares its options with the oracle for `selection`
 * (throws on a difference) and closes it.
 */
async function expectFacetOnce(
    page: Page,
    labels: Labels,
    rows: FacetRow[],
    selection: Selection,
    dim: Dimension
): Promise<string[]> {
    const shown = await openOptions(
        page,
        select(page, labels, dim),
        selectAllLabels(labels)
    );
    await closeSelect(page);
    const expected = facetOptions(rows, selection, dim);
    const problem = compareOptions(expected, shown);
    if (problem) throw new Error(`${dim} options differ: ${problem}`);
    // The client sorts the raw CMS names with the browser's own localeCompare
    // (Node's differs), so sort the raw expected names in the page.
    const sortedRaw = await page.evaluate(
        ([values, numeric]) =>
            [...values].sort((a, b) =>
                numeric ? Number(a) - Number(b) : a.localeCompare(b)
            ),
        [expected.map((o) => o.name), dim === "year"] as const
    );
    const sorted = sortedRaw.map(normalise);
    if (sorted.join("|") !== shown.join("|")) {
        throw new Error(`${dim} options are not sorted: ${shown.join(" | ")}`);
    }
    return shown;
}

/** Ticks the option called `name` in `dim`'s dropdown and applies it. */
export async function chooseFilterValue(
    page: Page,
    labels: Labels,
    dim: Dimension,
    name: string
): Promise<void> {
    await chooseOption(page, select(page, labels, dim), name, {
        what: `"${dim}"`,
    });
}

/** What a select currently shows as its value (empty when nothing is chosen). */
export async function shownValue(
    page: Page,
    labels: Labels,
    dim: Dimension
): Promise<string> {
    const text = await select(page, labels, dim).textContent();
    return normalise((text ?? "").replace(/​/g, ""));
}

/**
 * Compares `dim`'s dropdown with the oracle. The client recomputes its options
 * in an effect right after a selection is applied, so a dropdown opened that
 * instant can still show the previous list: retry for a few seconds, then fail
 * with the last difference.
 */
export async function expectFacet(
    page: Page,
    labels: Labels,
    rows: FacetRow[],
    selection: Selection,
    dim: Dimension
): Promise<string[]> {
    const deadline = Date.now() + 5_000;
    for (;;) {
        try {
            return await expectFacetOnce(page, labels, rows, selection, dim);
        } catch (error) {
            if (Date.now() > deadline) throw error;
            await page.waitForTimeout(250);
        }
    }
}
