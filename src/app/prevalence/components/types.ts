export interface ChartDataPoint {
    x: number;
    y: number;
    ciMin: number;
    ciMax: number;
    numberOfSamples?: number;
    numberOfPositive?: number;
}

/** One combination (sample origin × matrix × sampling stage) in the graph. */
export interface ChartSeries {
    label: string;
    data: { [year: number]: ChartDataPoint };
}
