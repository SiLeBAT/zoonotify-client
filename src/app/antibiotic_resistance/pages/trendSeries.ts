/**
 * Which substances the AMR Trend Graph draws. A trend needs at least two
 * points, so a substance is drawn — line and legend entry — only when it has
 * a plottable value in two or more of the years on the chart's axis. A value
 * is plottable when at least MIN_ISOLATES isolates were tested that year.
 */
export const MIN_ISOLATES = 10;
const MIN_TREND_YEARS = 2;

export function isPlottable(row: {
    anzahlGetesteterIsolate?: number;
}): boolean {
    return (
        row.anzahlGetesteterIsolate != null &&
        row.anzahlGetesteterIsolate >= MIN_ISOLATES
    );
}

export function substancesWithTrend(
    rows: {
        antimicrobialSubstance: string;
        samplingYear: number;
        anzahlGetesteterIsolate?: number;
    }[],
    axisYears: number[]
): Set<string> {
    const axis = new Set(axisYears);
    const yearsBySubstance = new Map<string, Set<number>>();
    rows.filter(
        (row) => isPlottable(row) && axis.has(row.samplingYear)
    ).forEach((row) => {
        const years =
            yearsBySubstance.get(row.antimicrobialSubstance) ?? new Set();
        years.add(row.samplingYear);
        yearsBySubstance.set(row.antimicrobialSubstance, years);
    });
    return new Set(
        Array.from(yearsBySubstance)
            .filter(([, years]) => years.size >= MIN_TREND_YEARS)
            .map(([substance]) => substance)
    );
}
