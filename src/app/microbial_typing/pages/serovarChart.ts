import type { TypingResult } from "./typingData";

/** Combinations with fewer isolates are not plotted (#1935). */
export const MIN_ISOLATES = 10;

/** How many serovars keep their own colour; the rest are lumped together. */
export const TOP_SEROVARS = 10;

/** Key of the lumped serovars; the chart translates it for display. */
export const OTHER_SEROVARS = "__other__";

/** One bar: a combination of sample origin, matrix and sampling stage. */
export interface SerovarBar {
    key: string;
    sampleOrigin: string;
    matrix: string;
    samplingStage: string;
    n: number;
    /** Percentage of the combination's isolates, by serovar. */
    shares: Record<string, number>;
}

export interface SerovarChart {
    /** Legend order: most isolates first, other serovars last. */
    serovars: string[];
    bars: SerovarBar[];
}

/**
 * The stacked bars of one sampling year, after the data steward's plot
 * (#1935): the ten serovars with the most isolates across all plotted
 * combinations keep their own segment, the rest share one.
 */
export function buildSerovarChart(
    rows: TypingResult[],
    year: number
): SerovarChart {
    const plotted = rows.filter(
        (row) =>
            row.samplingYear === year && row.numberOfIsolates >= MIN_ISOLATES
    );

    const weights = new Map<string, number>();
    for (const row of plotted) {
        const serovar = serovarOf(row);
        weights.set(
            serovar,
            (weights.get(serovar) ?? 0) + row.numberOfIsolatesInSubgroup
        );
    }
    const ranked = Array.from(weights.keys()).sort(
        (a, b) => (weights.get(b) ?? 0) - (weights.get(a) ?? 0)
    );
    const kept = new Set(ranked.slice(0, TOP_SEROVARS));
    const serovars =
        ranked.length > TOP_SEROVARS
            ? [...ranked.slice(0, TOP_SEROVARS), OTHER_SEROVARS]
            : ranked;

    const bars = new Map<string, SerovarBar>();
    for (const row of plotted) {
        const sampleOrigin = row.sampleOrigin?.name ?? "";
        const matrix = row.matrix?.name ?? "";
        const samplingStage = row.samplingStage?.name ?? "";
        const key = [sampleOrigin, matrix, samplingStage].join("|");
        let bar = bars.get(key);
        if (!bar) {
            bar = {
                key,
                sampleOrigin,
                matrix,
                samplingStage,
                n: row.numberOfIsolates,
                shares: {},
            };
            bars.set(key, bar);
        }
        const serovar = serovarOf(row);
        const segment = kept.has(serovar) ? serovar : OTHER_SEROVARS;
        bar.shares[segment] =
            (bar.shares[segment] ?? 0) +
            (100 * row.numberOfIsolatesInSubgroup) / row.numberOfIsolates;
    }

    return { serovars, bars: Array.from(bars.values()) };
}

function serovarOf(row: TypingResult): string {
    return row.typingSubgroup?.name ?? "";
}
