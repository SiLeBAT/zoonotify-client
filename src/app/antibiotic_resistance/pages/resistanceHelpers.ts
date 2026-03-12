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

export interface ResistanceApiItem {
    id: number;
    samplingYear: number;
    superCategorySampleOrigin?: {
        id: number;
        name: string;
        documentId: string;
    } | null;
    sampleOrigin?: { id: number; name: string; documentId: string } | null;
    samplingStage?: { id: number; name: string; documentId: string } | null;
    matrixGroup?: { id: number; name: string; documentId: string } | null;
    matrix?: { id: number; name: string; documentId: string } | null;
    antimicrobialSubstance?: {
        id: number;
        name: string;
        documentId: string;
    } | null;
    specie?: { id: number; name: string; documentId: string } | null;
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
    item: ResistanceApiItem,
    key: FilterKey
): { name: string; documentId: string } | null {
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
    items: ResistanceApiItem[]
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
    items: ResistanceApiItem[]
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

/**
 * Organisms stored in the DB with full translated names (both EN and DE)
 * instead of the short abbreviation shown in the UI.
 * e.g. "MRSA" → "Methicillin-resistant Staphylococcus aureus (MRSA)"
 *               "Methicillin-resistente Staphylococcus aureus (MRSA)"
 */
const CONTAINS_FILTER_ORGANISMS = new Set(["MRSA", "STEC"]);

/**
 * Returns the Strapi filter query segment for a microorganism name.
 * Uses $containsi for organisms whose UI name is an abbreviation that
 * appears inside the full DB name (e.g. "(MRSA)", "(STEC)").
 * Falls back to exact $eq match for all other organisms.
 */
export function buildMicroorganismFilter(microorganism: string): string {
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
