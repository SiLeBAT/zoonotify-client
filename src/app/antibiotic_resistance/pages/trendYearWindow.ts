/**
 * Chart year window for the AMR Trend Graph — a view-only, contiguous range
 * over the charts' year (x) axis, shared by every chart of the search so that
 * charts of different matrices can be compared on identical axes. It reframes
 * the charts (and the PNG figure export) only, never the CSV data download.
 * Mirrors the prevalence page's window; see
 * docs/context/prevalence-visualization.md (monorepo root).
 */
export type YearWindow = [number, number];

/** Distinct finite sampling years, ascending. */
export function distinctYears(rows: { samplingYear: number }[]): number[] {
    const years = rows.map((row) => row.samplingYear).filter(Number.isFinite);
    return Array.from(new Set(years)).sort((a, b) => a - b);
}

/**
 * The contiguous years a chart's x-axis shows: the window when one is set
 * (so every chart gets the same axis, even years it has no data for),
 * otherwise the chart's own data span.
 */
export function chartYearAxis(
    dataYears: number[],
    yearWindow?: YearWindow | null
): number[] {
    const [start, end] = yearWindow ?? [
        Math.min(...dataYears),
        Math.max(...dataYears),
    ];
    if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Slider tick marks: one per year with data. Labels are thinned to ~10 so
 * long spans stay readable; the first and last year are always labelled.
 */
export function yearSliderMarks(
    years: number[]
): { value: number; label?: string }[] {
    if (years.length < 2) return [];
    const labelEvery = Math.ceil(years.length / 10);
    return years.map((year, index) => ({
        value: year,
        label:
            index === 0 ||
            index === years.length - 1 ||
            index % labelEvery === 0
                ? String(year)
                : undefined,
    }));
}
