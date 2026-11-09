import LZString from "lz-string";
import {
    type FilterKey,
    type ResistanceApiItem,
    emptyFilterState,
    buildDocIdToNameMap,
} from "./resistanceHelpers";

/**
 * The Substance graph's `?s=` URL state: an lz-string-compressed JSON payload
 * `{ m, v: "substance", l, f, y?, c? }`. `l` carries the language; `f` holds
 * the filters under short keys. This is the single encoder/decoder for the
 * payload: the Substance graph and the Link Finder both build links with it.
 */

type ShortKey = "y" | "a" | "s" | "u" | "o" | "g" | "mG" | "m";

const SHORT_MAP: Record<ShortKey, FilterKey> = {
    y: "samplingYear",
    a: "antimicrobialSubstance",
    s: "specie",
    u: "superCategorySampleOrigin",
    o: "sampleOrigin",
    g: "samplingStage",
    mG: "matrixGroup",
    m: "matrix",
};

const LONG_TO_SHORT = Object.fromEntries(
    Object.entries(SHORT_MAP).map(([shortK, longK]) => [longK, shortK])
) as Record<FilterKey, ShortKey>;

export interface SubstanceUrlState {
    /** The AMR page's organism label, e.g. "Salmonella spp.". */
    microorganism: string;
    /** Filter values by key. Values are names, or CMS docIds when `dataItems` is given. */
    selected: Partial<Record<FilterKey, string[]>>;
    /** Antimicrobial substances; when non-empty it replaces `selected.antimicrobialSubstance`. */
    substanceFilter: string[];
    chartYear?: number;
    /** Stable name-keys of the combinations shown in the graph. */
    combinations?: string[];
    /** When given, docId values are written as their names (stable across CMS reimports). */
    dataItems?: ResistanceApiItem[];
}

export interface DecodedSubstanceUrlState {
    microorganism?: string;
    lang?: string;
    selected: Record<FilterKey, string[]>;
    substanceFilter: string[];
    chartYear?: number;
    combinations: string[];
}

/** Encodes a Substance graph state and language as the `?s=` value. Pure. */
export function encodeSubstanceState(
    state: SubstanceUrlState,
    lang: string
): string {
    const {
        microorganism,
        selected,
        substanceFilter,
        chartYear,
        combinations,
        dataItems,
    } = state;
    // Build docId->name map for converting filter values to names
    const docIdToName = dataItems
        ? buildDocIdToNameMap(dataItems)
        : ({} as Record<FilterKey, Map<string, string>>);

    const f: Partial<Record<ShortKey, string[]>> = {};
    (Object.keys(selected) as FilterKey[]).forEach((k) => {
        const val = selected[k];
        if (val && val.length) {
            if (k === "samplingYear" || !docIdToName[k]) {
                f[LONG_TO_SHORT[k]] = val;
            } else {
                // Convert docIds to names for URL stability
                f[LONG_TO_SHORT[k]] = val.map(
                    (docId) => docIdToName[k].get(docId) ?? docId
                );
            }
        }
    });
    if (substanceFilter.length) {
        const subMap = docIdToName.antimicrobialSubstance;
        f[LONG_TO_SHORT.antimicrobialSubstance] = subMap
            ? substanceFilter.map((docId) => subMap.get(docId) ?? docId)
            : substanceFilter;
    }

    const payload: {
        m: string;
        v: "substance";
        l: string;
        f: Partial<Record<ShortKey, string[]>>;
        y?: number;
        c?: string[];
    } = { m: microorganism, v: "substance", l: lang, f };

    if (typeof chartYear === "number") payload.y = chartYear;
    if (combinations && combinations.length) payload.c = combinations;

    return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

/** Decodes a `?s=` value; null when missing or unreadable. */
export function decodeSubstanceState(
    sParam: string | null
): DecodedSubstanceUrlState | null {
    if (!sParam) return null;
    try {
        const json = LZString.decompressFromEncodedURIComponent(sParam);
        if (!json) return null;
        const { m, l, f, y, c } = JSON.parse(json) as {
            m?: string;
            l?: string;
            f?: Partial<Record<ShortKey, string[]>>;
            y?: number;
            c?: string[];
        };

        const selected: Record<FilterKey, string[]> = { ...emptyFilterState };
        (Object.keys(f || {}) as ShortKey[]).forEach((sk) => {
            const longKey = SHORT_MAP[sk];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (longKey) selected[longKey] = (f as any)[sk] || [];
        });

        const substanceFilter = selected.antimicrobialSubstance || [];
        const chartYear = typeof y === "number" ? y : undefined;
        const combinations = Array.isArray(c) ? c : [];

        return {
            microorganism: m,
            lang: l,
            selected,
            substanceFilter,
            chartYear,
            combinations,
        };
    } catch {
        return null;
    }
}
