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

    data.forEach((tableRow) => {
        const seriesValues: number[] = [];
        xValues.forEach((xValue) => {
            seriesValues.push(Number.parseFloat(tableRow[xValue]));
        });
        const groupData: ApexChartData = {
            name: tableRow.name,
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
