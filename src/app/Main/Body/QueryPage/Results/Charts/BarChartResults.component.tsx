import React from "react";
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";

type XYType = { name: string; data: number[] };

function processingJsonApex(
    JSONTable: Record<string, string>[],
    xValues: string[]
): XYType[] {
    const graphData = [] as XYType[];

    JSONTable.forEach((tableRow) => {
        const seriesValues: number[] = [];
        xValues.forEach((element) => {
            seriesValues.push(Number.parseFloat(tableRow[element]));
        });
        const groupData: XYType = { name: tableRow.name, data: seriesValues };
        graphData.push(groupData);
    });

    return graphData;
}

export function BarChartResultsComponent(props: {
    columnAttributes: string[];
    graphicData: Record<string, string>[];
}): JSX.Element {
    const dataList = processingJsonApex(
        props.graphicData,
        props.columnAttributes
    );

    const chartOptions: ApexOptions = {
        chart: {
            type: "bar",
            height: 430,
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
            enabled: true,
            style: {
                fontSize: "10px",
                colors: [primaryColor],
            },
            background: {
                enabled: true,
                foreColor: "#fff",
                padding: 3,
                borderRadius: 2,
                borderWidth: 1,
                opacity: 0.4,
                dropShadow: {
                    enabled: false,
                },
            },
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
        series: dataList,
        options: chartOptions,
    };

    return (
        <ReactApexChart
            options={chartProps.options}
            series={chartProps.series}
            type="bar"
            height={430}
        />
    );
}
