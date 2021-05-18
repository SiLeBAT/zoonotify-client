import React from "react";
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import _ from "lodash";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import { LoadingProcessComponent } from "../../../../../Shared/LoadingProcess.component";

type ApexChartData = { name: string; data: number[] };

function processingTableDataToApexData(
    data: Record<string, string>[],
    xValues: string[]
): ApexChartData[] {
    const apexChartData = [] as ApexChartData[];

    data.forEach((chartSeries) => {
        const seriesValues: number[] = [];
        xValues.forEach((element) => {
            seriesValues.push(Number.parseFloat(chartSeries[element]));
        });
        const groupData: ApexChartData = {
            name: chartSeries.name,
            data: seriesValues,
        };
        apexChartData.push(groupData);
    });

    return apexChartData;
}

export function BarChartResultsComponent(props: {
    columnAttributes: string[];
    chartData: Record<string, string>[];
}): JSX.Element {
    const apexDataList = processingTableDataToApexData(
        props.chartData,
        props.columnAttributes
    );

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
            "#b3cae3",
            "#03479a",
            "#81a7d1",
            "#023d90",
            "#4f83be",
            "#023586",
            "#2969b0",
            "#012575",
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
            categories: props.columnAttributes,
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
        series: apexDataList,
        options: chartOptions,
    };

    if (_.isEmpty(chartProps.series)) {
        return <LoadingProcessComponent />;
    }

    return (
        <ReactApexChart
            options={chartProps.options}
            series={chartProps.series}
            type="bar"
        />
    );
}
