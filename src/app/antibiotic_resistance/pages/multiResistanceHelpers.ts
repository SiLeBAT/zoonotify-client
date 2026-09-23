// --- Pure logic of the Multi-resistance Graph ---
import LZString from "lz-string";
import {
    type FilterKey,
    type ResistanceRelationFields,
    buildCombinationKey,
    buildDocIdToNameMap,
    buildNameToDocIdMap,
    emptyFilterState,
    resolveUrlValueToDocId,
    meetsMinimumN,
    shouldShowSpeciesFilter,
} from "./resistanceHelpers";

/**
 * Resistance group codes (ADR 0008): 0 susceptible, 1–4 = n× resistant,
 * 5 = >4×, 6–9 = 5×–8×, 10 = >8×. The steward bins most microorganisms into
 * six groups; MRSA into ten, continuing past 4× instead of stopping at >4×.
 */
export const RESISTANCE_GROUP_CODES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SIX_GROUP_SCHEME = [0, 1, 2, 3, 4, 5];
const TEN_GROUP_SCHEME = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10];

/** One Resistance group of one Combination, as the data delivers it. */
export interface MultiResistanceItem extends ResistanceRelationFields {
    id: number;
    matrixDetail?: ResistanceRelationFields["matrix"];
    /** Resistance group code, see `RESISTANCE_GROUP_CODES`. */
    resistanceGroup: number;
    anzahlIsolate: number;
    anzahlGetesteterIsolate: number;
}

/** The groups one microorganism's bars split into, in order: its rows use one scheme. */
export function resistanceGroupScheme(rows: MultiResistanceItem[]): number[] {
    return rows.some((r) => r.resistanceGroup > 5)
        ? TEN_GROUP_SCHEME
        : SIX_GROUP_SCHEME;
}

export interface ResistanceGroupShare {
    rank: number;
    count: number;
    proportion: number;
}

export interface MultiResistanceBar {
    key: string;
    /** Combination name without N, for the picker. */
    name: string;
    /** `name (N = …)`, for the chart axis and the CSV. */
    label: string;
    n: number;
    groups: ResistanceGroupShare[];
}

export interface MultiResistanceBars {
    bars: MultiResistanceBar[];
    /** Combinations under the Minimum N: listed in the picker, never plotted. */
    belowMinimum: MultiResistanceBar[];
}

/** `[Species –] Matrix – Sample origin – Sampling stage`; matrix detail is not part of a Combination. */
export function buildMultiResistanceName(
    row: MultiResistanceItem,
    microorganism: string
): string {
    const parts = [
        shouldShowSpeciesFilter(microorganism) ? row.specie?.name : undefined,
        row.matrix?.name,
        row.sampleOrigin?.name,
        row.samplingStage?.name,
    ].filter((part): part is string => Boolean(part));
    return parts.join(" – ");
}

/**
 * One bar per Combination, split into the microorganism's Resistance groups
 * by their share of that Combination's tested isolates. Rows are never pooled.
 */
export function buildMultiResistanceBars(
    rows: MultiResistanceItem[],
    microorganism: string
): MultiResistanceBars {
    const scheme = resistanceGroupScheme(rows);
    const byKey = new Map<string, MultiResistanceItem[]>();
    for (const row of rows) {
        const key = buildCombinationKey(row, microorganism);
        byKey.set(key, [...(byKey.get(key) ?? []), row]);
    }

    const all = Array.from(byKey.entries()).map(([key, cell]) => {
        const n = cell[0].anzahlGetesteterIsolate;
        const groups = scheme.map((rank) => {
            const count =
                cell.find((r) => r.resistanceGroup === rank)?.anzahlIsolate ??
                0;
            return { rank, count, proportion: count / n };
        });
        const name = buildMultiResistanceName(cell[0], microorganism);
        return { key, name, label: `${name} (N = ${n})`, n, groups };
    });

    return {
        bars: all.filter((b) => meetsMinimumN(b.n)),
        belowMinimum: all.filter((b) => !meetsMinimumN(b.n)),
    };
}

export interface MultiResistanceCsvOptions {
    sep: "," | ";";
    decimalSep: "." | ",";
    /** Localized: Combination, Resistance group, isolates, N, percent. */
    headers: string[];
    /** Localized Resistance group names, indexed by code. */
    groupLabels: string[];
}

/** Data download: one row per Combination × Resistance group. */
export function toMultiResistanceCsv(
    bars: MultiResistanceBar[],
    { sep, decimalSep, headers, groupLabels }: MultiResistanceCsvOptions
): string {
    const field = (s: string): string =>
        s.includes(sep) || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s;
    const percent = (proportion: number): string =>
        (proportion * 100).toFixed(1).replace(".", decimalSep);

    const rows = bars.flatMap((bar) =>
        bar.groups.map((g) =>
            [
                field(bar.label),
                field(groupLabels[g.rank] ?? String(g.rank)),
                String(g.count),
                String(bar.n),
                percent(g.proportion),
            ].join(sep)
        )
    );
    return [headers.map(field).join(sep), ...rows].join("\n");
}

/** What a Multi-resistance share link restores. */
export interface MultiResistanceState {
    microorganism: string;
    lang: string;
    /** Filter-panel selections, as documentIds. */
    selected: Record<FilterKey, string[]>;
    year?: number;
    /** Selected Combination keys. */
    combinations: string[];
}

interface SharePayload {
    m: string;
    v: "multi";
    l: string;
    f: Partial<Record<FilterKey, string[]>>;
    y?: number;
    c: string[];
}

/**
 * Compressed `?s=` value. Filters travel as names, like the Substance Graph's,
 * so a link survives re-imported documentIds.
 */
export function encodeMultiResistanceState(
    state: MultiResistanceState,
    rows: MultiResistanceItem[]
): string {
    const docIdToName = buildDocIdToNameMap(rows);
    const f: Partial<Record<FilterKey, string[]>> = {};
    (Object.keys(state.selected) as FilterKey[]).forEach((k) => {
        const ids = state.selected[k];
        if (ids.length) f[k] = ids.map((id) => docIdToName[k].get(id) ?? id);
    });
    const payload: SharePayload = {
        m: state.microorganism,
        v: "multi",
        l: state.lang,
        f,
        c: state.combinations,
    };
    if (state.year !== undefined) payload.y = state.year;
    return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

/** Inverse of `encodeMultiResistanceState`; null for a link it cannot read. */
export function decodeMultiResistanceState(
    s: string,
    rows: MultiResistanceItem[]
): MultiResistanceState | null {
    let payload: Partial<SharePayload>;
    try {
        payload = JSON.parse(
            LZString.decompressFromEncodedURIComponent(s) ?? ""
        );
    } catch {
        return null;
    }
    if (!payload || typeof payload.m !== "string") return null;

    const nameToDocId = buildNameToDocIdMap(rows);
    const docIdToName = buildDocIdToNameMap(rows);
    const selected = { ...emptyFilterState };
    (Object.keys(payload.f ?? {}) as FilterKey[]).forEach((k) => {
        if (!(k in selected)) return;
        selected[k] = (payload.f?.[k] ?? [])
            .map((v) =>
                resolveUrlValueToDocId(v, nameToDocId[k], docIdToName[k])
            )
            .filter((v): v is string => v !== undefined);
    });

    return {
        microorganism: payload.m,
        lang: payload.l ?? "",
        selected,
        year: typeof payload.y === "number" ? payload.y : undefined,
        combinations: Array.isArray(payload.c) ? payload.c : [],
    };
}
