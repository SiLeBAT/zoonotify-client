import type { TypingResult } from "./typingData";

/** The typing page's Search Options, in panel order (#1948). */
export const TYPING_FILTER_KEYS = [
    "superCategorySampleOrigin",
    "sampleOrigin",
    "samplingStage",
    "matrixGroup",
    "matrix",
] as const;

export type TypingFilterKey = (typeof TYPING_FILTER_KEYS)[number];

/** Selected `documentId`s per filter; an empty list means "no restriction". */
export type TypingSelection = Record<TypingFilterKey, string[]>;

export const emptyTypingSelection: TypingSelection = {
    superCategorySampleOrigin: [],
    sampleOrigin: [],
    samplingStage: [],
    matrixGroup: [],
    matrix: [],
};

function matches(
    row: TypingResult,
    selection: TypingSelection,
    except?: TypingFilterKey
): boolean {
    return TYPING_FILTER_KEYS.every((key) => {
        const selected = selection[key];
        if (key === except || selected.length === 0) return true;
        const id = row[key]?.documentId;
        return id !== undefined && selected.includes(id);
    });
}

export interface TypingFilterOption {
    documentId: string;
    name: string;
}

/**
 * What each dropdown offers: the values of the rows matching every *other*
 * filter's selection, so the options cascade while a filter's own
 * alternatives stay pickable.
 */
export function typingFilterOptions(
    rows: TypingResult[],
    selection: TypingSelection
): Record<TypingFilterKey, TypingFilterOption[]> {
    const optionsFor = (key: TypingFilterKey): TypingFilterOption[] => {
        const byId = new Map<string, string>();
        for (const row of rows) {
            const value = row[key];
            if (!value?.documentId || !matches(row, selection, key)) continue;
            byId.set(value.documentId, value.name);
        }
        return Array.from(byId, ([documentId, name]) => ({
            documentId,
            name,
        })).sort((a, b) =>
            a.name.localeCompare(b.name, undefined, {
                numeric: true,
                sensitivity: "base",
            })
        );
    };
    return {
        superCategorySampleOrigin: optionsFor("superCategorySampleOrigin"),
        sampleOrigin: optionsFor("sampleOrigin"),
        samplingStage: optionsFor("samplingStage"),
        matrixGroup: optionsFor("matrixGroup"),
        matrix: optionsFor("matrix"),
    };
}

/**
 * The applied selection lives in the URL, one comma-joined parameter per
 * filter, so a shared link opens on the same search.
 */
export function readTypingSelection(params: URLSearchParams): TypingSelection {
    const selection = { ...emptyTypingSelection };
    for (const key of TYPING_FILTER_KEYS) {
        const value = params.get(key);
        selection[key] = value ? value.split(",") : [];
    }
    return selection;
}

/** Writes `selection` into `params`, dropping filters left empty. */
export function writeTypingSelection(
    params: URLSearchParams,
    selection: TypingSelection
): void {
    for (const key of TYPING_FILTER_KEYS) {
        if (selection[key].length > 0) {
            params.set(key, selection[key].join(","));
        } else {
            params.delete(key);
        }
    }
}

/** The rows matching every filter that has a selection. */
export function filterTypingRows(
    rows: TypingResult[],
    selection: TypingSelection
): TypingResult[] {
    return rows.filter((row) => matches(row, selection));
}
