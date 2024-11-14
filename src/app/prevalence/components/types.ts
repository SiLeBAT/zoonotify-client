export interface ChartDataPoint {
    x: number;
    y: number;
    ciMin: number;
    ciMax: number;
    numberOfSamples?: number;
    numberOfPositive?: number;
}
