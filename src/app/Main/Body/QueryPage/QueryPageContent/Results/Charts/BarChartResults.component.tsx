import React, { MutableRefObject, useRef, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { primaryColor } from "../../../../../../Shared/Style/Style-MainTheme.component";
import { ApexChartData } from "./ApexChart.model";

export function BarChartResultsComponent(props: {
    chartData: ApexChartData;
    getPngDownloadUriRef: MutableRefObject<(() => Promise<string>) | null>;
    xAxisLabel: string;
    yAxisLabel: string;
    xAxisMax?: number;
    displayAsStacked: boolean;
}): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const barChartRef = useRef<any>(null);

    useEffect(() => {
        // eslint-disable-next-line no-param-reassign
        props.getPngDownloadUriRef.current = async () => {
            return barChartRef.current?.chart
                .dataURI()
                .then((uri: { imgURI: string }) => uri.imgURI);
        };
    }, []);
    
    const chartOptions: ApexOptions = {
        chart: {
            type: "bar",
            toolbar: {
                show: false,
                tools: {
                    download: false,
                },
            },
            stacked: props.displayAsStacked,
        },
        plotOptions: {
            bar: {
                horizontal: true,
                dataLabels: {
                    position: "top",
                },
            },
        },
        colors: [
            primaryColor,
            "#226aaa",
            "#60a2ba",
            "#7ebdc2",
            "#b9ceb2",
            "#d6d7aa",
            "#f3dfa2",
            "#eed076",
            "#e8c04a",
        ],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: false,
        },
        tooltip: {
            shared: true,
            intersect: false,
            fixed: {
                enabled: true,
                position: "topRight",
            },
        },
        xaxis: {
            categories: props.chartData.dataLabels,
            title: {
                text: props.xAxisLabel,
                style: {
                    fontSize: "12px",
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontWeight: 600,
                    cssClass: "apexcharts-xaxis-title",
                },
            },
            max: props.xAxisMax
        },
        yaxis: {
            showForNullSeries: false,
            labels: {
                show: true,
                align: "right",
                minWidth: 0,
                maxWidth: 500,
            },
            title: {
                text: props.yAxisLabel,
                style: {
                    fontSize: "12px",
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontWeight: 600,
                    cssClass: "apexcharts-xaxis-title",
                },
            },
        },
        legend: {
            onItemClick: {
                toggleDataSeries: false,
            },
        },
    };

    const chartProps = {
        series: props.chartData.series,
        options: chartOptions,
    };

    return (
        <ReactApexChart
            ref={barChartRef}
            options={chartProps.options}
            series={chartProps.series}
            type="bar"
        />
    );
}
