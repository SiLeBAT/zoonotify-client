import React, { MutableRefObject } from "react";
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import { ApexChartData } from "./ApexChart.model";

export function BarChartResultsComponent(props: {
    chartData: ApexChartData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    barChartRef: MutableRefObject<any>;
}): JSX.Element {
    const chartOptions: ApexOptions = {
        chart: {
            type: "bar",
            toolbar: {
                show: false,
                tools: {
                    download: false,
                },
            },
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
        },
        yaxis: {
            showForNullSeries: false,
            labels: {
                show: true,
                align: "right",
                minWidth: 0,
                maxWidth: 500,
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
            ref={props.barChartRef}
            options={chartProps.options}
            series={chartProps.series}
            type="bar"
        />
    );
}
