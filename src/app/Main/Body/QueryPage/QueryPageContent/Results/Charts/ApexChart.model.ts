export type ApexChartData = {
    dataLabels: string[];
    series: {
        name: string;
        data: number[];
    }[];
};

export type ApexChartInfo = {
    xAxisLabel: string;
    yAxisLabel: string;
    data: ApexChartData;
};
