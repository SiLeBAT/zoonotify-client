import type { TypingResult } from "./typingData";

/** Combinations with fewer isolates are not plotted (#1935). */
export const MIN_ISOLATES = 10;

/** How many serovars keep their own colour; the rest are lumped together. */
export const TOP_SEROVARS = 10;

/** Key of the lumped serovars; the chart translates it for display. */
export const OTHER_SEROVARS = "__other__";

/**
 * Organisms whose subgroups follow a fixed order rather than their isolate
 * count, as in the BfR report's figures: the Listeria serogroups (#1955) and
 * the MRSA clonal groups (#1956), whose "other CC398" is named per locale.
 * Subgroups not listed follow, by count.
 */
const SUBGROUP_ORDER: Record<string, string[]> = {
    "Listeria monocytogenes": ["IIa", "IIb", "IIc", "IVa", "IVb"],
    MRSA: [
        "CC398 t011",
        "CC398 t034",
        "other CC398",
        "andere CC398",
        "non CC398",
    ],
};

/** A combination of sample origin, matrix and sampling stage. */
export interface SerovarCombination {
    /** Built from the relations' documentIds, so it is the same in both locales. */
    key: string;
    sampleOrigin: string;
    matrix: string;
    samplingStage: string;
    n: number;
}

/** One bar: a plotted combination. */
export interface SerovarBar extends SerovarCombination {
    /** Percentage of the combination's isolates, by serovar. */
    shares: Record<string, number>;
}

export interface SerovarChart {
    /** Legend order: most isolates first, other serovars last. */
    serovars: string[];
    bars: SerovarBar[];
    /** The year's combinations under MIN_ISOLATES: listed, not plotted. */
    belowMinimum: SerovarCombination[];
}

/**
 * The stacked bars of one sampling year, after the data steward's plot
 * (#1935): the ten serovars with the most isolates across all plotted
 * combinations keep their own segment, the rest share one.
 */
export function buildSerovarChart(
    rows: TypingResult[],
    year: number,
    /** The typing organism's id; picks its subgroup order, if it has one. */
    organism?: string
): SerovarChart {
    const ofYear = rows.filter((row) => row.samplingYear === year);
    const plotted = ofYear.filter(
        (row) => row.numberOfIsolates >= MIN_ISOLATES
    );

    const weights = new Map<string, number>();
    for (const row of plotted) {
        const serovar = serovarOf(row, organism);
        weights.set(
            serovar,
            (weights.get(serovar) ?? 0) + row.numberOfIsolatesInSubgroup
        );
    }
    const ranked = Array.from(weights.keys()).sort(
        (a, b) => (weights.get(b) ?? 0) - (weights.get(a) ?? 0)
    );
    const kept = new Set(ranked.slice(0, TOP_SEROVARS));
    const order = (organism && SUBGROUP_ORDER[organism]) || [];
    // listed subgroups first, in their order; the rest keep their rank
    const position = (serovar: string): number =>
        order.includes(serovar) ? order.indexOf(serovar) : order.length;
    const top = ranked
        .slice(0, TOP_SEROVARS)
        .sort((a, b) => position(a) - position(b));
    const serovars =
        ranked.length > TOP_SEROVARS ? [...top, OTHER_SEROVARS] : top;

    const bars = new Map<string, SerovarBar>();
    for (const row of plotted) {
        const combination = combinationOf(row);
        let bar = bars.get(combination.key);
        if (!bar) {
            bar = { ...combination, shares: {} };
            bars.set(combination.key, bar);
        }
        const serovar = serovarOf(row, organism);
        const segment = kept.has(serovar) ? serovar : OTHER_SEROVARS;
        bar.shares[segment] =
            (bar.shares[segment] ?? 0) +
            (100 * row.numberOfIsolatesInSubgroup) / row.numberOfIsolates;
    }

    const belowMinimum = new Map<string, SerovarCombination>();
    for (const row of ofYear) {
        if (row.numberOfIsolates >= MIN_ISOLATES) continue;
        const combination = combinationOf(row);
        belowMinimum.set(combination.key, combination);
    }

    return {
        serovars,
        bars: Array.from(bars.values()),
        belowMinimum: Array.from(belowMinimum.values()),
    };
}

function combinationOf(row: TypingResult): SerovarCombination {
    return {
        key: [row.sampleOrigin, row.matrix, row.samplingStage]
            .map((relation) => relation?.documentId ?? "")
            .join("|"),
        sampleOrigin: row.sampleOrigin?.name ?? "",
        matrix: row.matrix?.name ?? "",
        samplingStage: row.samplingStage?.name ?? "",
        n: row.numberOfIsolates,
    };
}

/**
 * Organisms whose subgroup names may carry their serotypes in brackets, which
 * are dropped so the rows count towards the bare serogroup: on zoonotify-dev
 * "IIa (1/2a. 3a)" sits beside "IIa" (#1955). Variants such as "IVb-v1" have
 * no brackets and stay apart.
 */
const SEROTYPES_IN_BRACKETS = ["Listeria monocytogenes"];

function serovarOf(row: TypingResult, organism?: string): string {
    const name = row.typingSubgroup?.name ?? "";
    return organism && SEROTYPES_IN_BRACKETS.includes(organism)
        ? name.replace(/\s*\(.*\)$/, "")
        : name;
}
