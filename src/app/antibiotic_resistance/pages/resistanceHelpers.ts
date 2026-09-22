// --- Shared types and helper functions for resistance pages ---

export type FilterKey =
    | "samplingYear"
    | "antimicrobialSubstance"
    | "specie"
    | "superCategorySampleOrigin"
    | "sampleOrigin"
    | "samplingStage"
    | "matrixGroup"
    | "matrix";

export type FilterOption = {
    id: string;
    name: string;
    documentId: string;
};

export const emptyFilterState: Record<FilterKey, string[]> = {
    samplingYear: [],
    antimicrobialSubstance: [],
    specie: [],
    superCategorySampleOrigin: [],
    sampleOrigin: [],
    samplingStage: [],
    matrixGroup: [],
    matrix: [],
};

type Relation = { id: number; name: string; documentId: string } | null;

/**
 * The sampling year and relations every AMR row carries, whatever it measures.
 * The filter panel and Combination helpers work on this alone, so they serve
 * each graph's row type.
 */
export interface ResistanceRelationFields {
    samplingYear: number;
    superCategorySampleOrigin?: Relation;
    sampleOrigin?: Relation;
    samplingStage?: Relation;
    matrixGroup?: Relation;
    matrix?: Relation;
    antimicrobialSubstance?: Relation;
    specie?: Relation;
}

export interface ResistanceApiItem extends ResistanceRelationFields {
    id: number;
    resistenzrate: number;
    anzahlGetesteterIsolate: number;
    anzahlResistenterIsolate: number;
    minKonfidenzintervall: number;
    maxKonfidenzintervall: number;
}

const RELATION_FILTER_KEYS: FilterKey[] = [
    "specie",
    "superCategorySampleOrigin",
    "sampleOrigin",
    "samplingStage",
    "matrixGroup",
    "matrix",
    "antimicrobialSubstance",
];

/** Get the relation object for a given filter key from a data item */
export function getRelObject(
    item: ResistanceRelationFields,
    key: FilterKey
): Relation {
    switch (key) {
        case "specie":
            return item.specie ?? null;
        case "superCategorySampleOrigin":
            return item.superCategorySampleOrigin ?? null;
        case "sampleOrigin":
            return item.sampleOrigin ?? null;
        case "samplingStage":
            return item.samplingStage ?? null;
        case "matrixGroup":
            return item.matrixGroup ?? null;
        case "matrix":
            return item.matrix ?? null;
        case "antimicrobialSubstance":
            return item.antimicrobialSubstance ?? null;
        default:
            return null;
    }
}

/** Build docId->name map for all filter keys */
export function buildDocIdToNameMap(
    items: ResistanceRelationFields[]
): Record<FilterKey, Map<string, string>> {
    const result = {} as Record<FilterKey, Map<string, string>>;
    for (const k of RELATION_FILTER_KEYS) {
        const m = new Map<string, string>();
        for (const item of items) {
            const obj = getRelObject(item, k);
            if (obj?.documentId && obj?.name) m.set(obj.documentId, obj.name);
        }
        result[k] = m;
    }
    result.samplingYear = new Map<string, string>();
    return result;
}

/** Build name->docId map for all filter keys */
export function buildNameToDocIdMap(
    items: ResistanceRelationFields[]
): Record<FilterKey, Map<string, string>> {
    const result = {} as Record<FilterKey, Map<string, string>>;
    for (const k of RELATION_FILTER_KEYS) {
        const m = new Map<string, string>();
        for (const item of items) {
            const obj = getRelObject(item, k);
            if (obj?.name && obj?.documentId) m.set(obj.name, obj.documentId);
        }
        result[k] = m;
    }
    result.samplingYear = new Map<string, string>();
    return result;
}

/** Fewest tested isolates a Combination needs to be plotted. */
export const MINIMUM_N = 10;

/** Minimum N: a Combination below it gets no bar and is listed as "data is not plotted". */
export function meetsMinimumN(testedIsolates: number): boolean {
    return testedIsolates >= MINIMUM_N;
}

/** Campylobacter and Enterococcus are split by species, so their graphs filter and key by it. */
export function shouldShowSpeciesFilter(microorganism: string): boolean {
    return (
        microorganism === "Campylobacter spp." ||
        microorganism === "Enterococcus spp."
    );
}

/**
 * Stable Combination key from documentIds: language-independent, so it survives
 * locale switches and is what share links store.
 */
export function buildCombinationKey(
    entry: ResistanceRelationFields,
    microorganism: string
): string {
    const parts: string[] = [];

    // include species for only those microorganisms where it's relevant/visible
    if (shouldShowSpeciesFilter(microorganism)) {
        parts.push(entry.specie?.documentId ?? "-");
    }

    parts.push(entry.superCategorySampleOrigin?.documentId ?? "-");
    parts.push(entry.sampleOrigin?.documentId ?? "-");
    parts.push(entry.samplingStage?.documentId ?? "-");
    parts.push(entry.matrixGroup?.documentId ?? "-");
    parts.push(entry.matrix?.documentId ?? "-");

    return parts.join("|");
}

/** Localized Combination label, from the relation names in the row's locale. */
export function buildCombinationLabel(
    r: ResistanceRelationFields,
    microorganism: string
): string {
    const parts = [
        r.matrix?.name ?? "",
        r.sampleOrigin?.name ?? "",
        r.samplingStage?.name ?? "",
    ];
    if (shouldShowSpeciesFilter(microorganism)) {
        parts.unshift(r.specie?.name ?? "");
    }
    return parts.join(" | ");
}

/** Filter-panel options for one key: years sorted, relations once per documentId. */
export function uniqueFromItems(
    items: ResistanceRelationFields[],
    key: FilterKey
): FilterOption[] {
    if (key === "samplingYear") {
        const years = Array.from(
            new Set(
                items
                    .map((i) => i.samplingYear)
                    .filter(Boolean)
                    .map(String)
            )
        ).sort();
        return years.map((y) => ({ id: y, name: y, documentId: y }));
    }

    const map = new Map<string, { id: string; name: string }>();

    for (const row of items) {
        const obj = getRelObject(row, key);

        if (obj?.documentId && obj?.name && obj?.id !== undefined) {
            map.set(obj.documentId, { id: String(obj.id), name: obj.name });
        }
    }

    return Array.from(map.entries()).map(([documentId, v]) => ({
        id: v.id,
        name: v.name,
        documentId,
    }));
}

/**
 * Rows matching every selection except `excludeKey`'s own, so each filter's
 * options cascade from the others. Substances are selected separately (`sub`).
 */
export function filterDataExcludingKey<T extends ResistanceRelationFields>(
    data: T[],
    sel: Record<FilterKey, string[]>,
    sub: string[],
    excludeKey: FilterKey
): T[] {
    let result = data;

    if (excludeKey !== "samplingYear" && sel.samplingYear.length) {
        result = result.filter((r) =>
            sel.samplingYear.includes(String(r.samplingYear))
        );
    }
    if (excludeKey !== "specie" && sel.specie.length) {
        result = result.filter(
            (r) => r.specie && sel.specie.includes(r.specie.documentId)
        );
    }
    if (
        excludeKey !== "superCategorySampleOrigin" &&
        sel.superCategorySampleOrigin.length
    ) {
        result = result.filter(
            (r) =>
                r.superCategorySampleOrigin &&
                sel.superCategorySampleOrigin.includes(
                    r.superCategorySampleOrigin.documentId
                )
        );
    }
    if (excludeKey !== "sampleOrigin" && sel.sampleOrigin.length) {
        result = result.filter(
            (r) =>
                r.sampleOrigin &&
                sel.sampleOrigin.includes(r.sampleOrigin.documentId)
        );
    }
    if (excludeKey !== "samplingStage" && sel.samplingStage.length) {
        result = result.filter(
            (r) =>
                r.samplingStage &&
                sel.samplingStage.includes(r.samplingStage.documentId)
        );
    }
    if (excludeKey !== "matrixGroup" && sel.matrixGroup.length) {
        result = result.filter(
            (r) =>
                r.matrixGroup &&
                sel.matrixGroup.includes(r.matrixGroup.documentId)
        );
    }
    if (excludeKey !== "matrix" && sel.matrix.length) {
        result = result.filter(
            (r) => r.matrix && sel.matrix.includes(r.matrix.documentId)
        );
    }

    // antimicrobialSubstance uses substanceFilter (sub)
    if (excludeKey !== "antimicrobialSubstance" && sub.length) {
        result = result.filter(
            (r) =>
                r.antimicrobialSubstance &&
                sub.includes(r.antimicrobialSubstance.documentId)
        );
    }

    return result;
}

/**
 * Organisms stored in the DB with full translated names (both EN and DE)
 * instead of the short abbreviation shown in the UI.
 * e.g. "MRSA" → "Methicillin-resistant Staphylococcus aureus (MRSA)"
 *               "Methicillin-resistente Staphylococcus aureus (MRSA)"
 */
const CONTAINS_FILTER_ORGANISMS = new Set(["MRSA", "STEC"]);

/**
 * Organisms matched by a bare substring of their DB name rather than by the
 * "(ABBREV)" pattern above. "ESBL/AmpC E. coli" is stored with a translated
 * qualifier ("ESBL/AmpC-producing E. coli" / "ESBL/AmpC-bildende E. coli"),
 * so the "ESBL" stem is the only locale-stable part of the name.
 */
const SUBSTRING_FILTER_ORGANISMS: Record<string, string> = {
    "ESBL/AmpC E. coli": "ESBL",
};

/**
 * Returns the Strapi filter query segment for a microorganism name.
 * Uses $containsi for organisms whose UI name is an abbreviation that
 * appears inside the full DB name (e.g. "(MRSA)", "(STEC)").
 * Falls back to exact $eq match for all other organisms.
 */
export function buildMicroorganismFilter(microorganism: string): string {
    const substringMatch = SUBSTRING_FILTER_ORGANISMS[microorganism];
    if (substringMatch) {
        return `&filters[microorganism][name][$containsi]=${encodeURIComponent(
            substringMatch
        )}`;
    }
    if (CONTAINS_FILTER_ORGANISMS.has(microorganism)) {
        return `&filters[microorganism][name][$containsi]=${encodeURIComponent(
            `(${microorganism})`
        )}`;
    }
    return `&filters[microorganism][name][$eq]=${encodeURIComponent(
        microorganism
    )}`;
}

/** Resolve a URL value (name or old docId) to docId with backwards compat */
export function resolveUrlValueToDocId(
    value: string,
    nameToDocId: Map<string, string>,
    docIdToName: Map<string, string>
): string | undefined {
    const byName = nameToDocId.get(value);
    if (byName) return byName;
    if (docIdToName.has(value)) return value;
    return undefined;
}
