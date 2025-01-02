import React from "react";
import { Box, Button } from "@mui/material";
import { Bar } from "react-chartjs-2";
// eslint-disable-next-line import/named
import { Chart as ChartJS, TooltipItem } from "chart.js";

import {
    errorBarTooltipPlugin,
    drawErrorBars,
    whiteBackgroundAndLogoPlugin,
} from "./chartPlugins";
import { useTranslation } from "react-i18next";
import { ChartDataPoint } from "./types";

const pushLegendDownPlugin = {
    id: "pushLegendDownPlugin",
    beforeLayout(chart: ChartJS) {
        if (chart.legend) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chart.legend as any).top += 30;
        }
    },
};

const generateColorFromKey = (key: string): string => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 60%)`;
};

interface ChartCardProps {
    chartKey: string;
    chartData: { [year: number]: ChartDataPoint };
    chartRef: React.RefObject<ChartJS<"bar", ChartDataPoint[], unknown>>;
    currentMicroorganism: string | null;
    yearOptions: number[];
    xAxisMax: number;
    downloadChart: (
        chartRef: React.RefObject<ChartJS<"bar", ChartDataPoint[], unknown>>,
        chartKey: string
    ) => Promise<void>;
    prevalenceUpdateDate: string | null;
}

const ChartCard: React.FC<ChartCardProps> = ({
    chartKey,
    chartData,
    chartRef,
    currentMicroorganism,
    yearOptions,
    xAxisMax,
    downloadChart,
    prevalenceUpdateDate,
}) => {
    const { t } = useTranslation(["PrevalencePage"]);
    const chartColor = generateColorFromKey(chartKey);

    return (
        <Box
            sx={{
                backgroundColor: "white",
                height: "600px",
                padding: 5,
                paddingBottom: 8,
                borderRadius: 2,
                boxShadow: 2,
                margin: "0 5px",
                position: "relative",
            }}
        >
            <Bar
                data={{
                    labels: yearOptions,
                    datasets: [
                        {
                            label: chartKey,
                            data: yearOptions.map(
                                (year) =>
                                    chartData[year] || {
                                        x: 0,
                                        y: year,
                                        ciMin: 0,
                                        ciMax: 0,
                                    }
                            ) as ChartDataPoint[],
                            backgroundColor: chartColor,
                        },
                    ],
                }}
                options={{
                    indexAxis: "y",
                    maintainAspectRatio: false,
                    layout: {
                        // Keep this small so we don't move the title too far down
                        padding: { top: 0, bottom: 0, left: 0, right: 0 },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: t("Prevalence %"),
                                color: "black",
                                font: {
                                    size: 17,
                                    weight: "bold",
                                },
                            },
                            beginAtZero: true,
                            max: xAxisMax,
                            ticks: {
                                color: "black",
                                font: {
                                    size: 14,
                                },
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: t("Year"),
                                color: "black",
                                font: {
                                    size: 17,
                                    weight: "bold",
                                },
                            },
                            reverse: false,
                            ticks: {
                                color: "black",
                                font: {
                                    size: 13,
                                },
                                callback: function (_, index) {
                                    return yearOptions[index];
                                },
                            },
                        },
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: currentMicroorganism || "",
                            color: "black",
                            font: {
                                size: 17,
                                weight: "bold",
                            },
                            // Space between the chart title and the legend
                            padding: { bottom: 15 },
                        },
                        legend: {
                            position: "top",
                            labels: {
                                color: "black",
                                font: { size: 14 },
                                // Only affects spacing around legend items themselves
                                padding: 10,
                            },
                        },
                        tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 1)",
                            titleFont: { size: 14 },
                            bodyFont: { size: 12 },
                            displayColors: true,
                            borderColor: "#fff",
                            borderWidth: 2,
                            caretPadding: 120,
                            yAlign: "center",
                            callbacks: {
                                label: (context: TooltipItem<"bar">) => {
                                    const year = parseInt(
                                        context.label || "",
                                        10
                                    );
                                    const data = chartData[year] || {};
                                    const rawData =
                                        context.raw as ChartDataPoint;
                                    return [
                                        `${t("Prevalence")}: ${rawData.x}%`,
                                        `${t("CI_min")}: ${data.ciMin}`,
                                        `${t("CI_max")}: ${data.ciMax}`,
                                        `${t("Samples")}: ${
                                            data.numberOfSamples
                                        }`,
                                        `${t("Positive")}: ${
                                            data.numberOfPositive
                                        }`,
                                    ];
                                },
                            },
                        },
                        customTexts: {
                            generatedOn: t("Generated on"),
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any,
                    animation: false,
                }}
                plugins={[
                    errorBarTooltipPlugin,
                    {
                        id: "customErrorBars",
                        afterDraw: (chart: ChartJS) => drawErrorBars(chart),
                    },
                    whiteBackgroundAndLogoPlugin(prevalenceUpdateDate),
                    // The plugin that moves the legend further down
                    pushLegendDownPlugin,
                ]}
                ref={chartRef}
            />
            <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
                <Button
                    variant="contained"
                    size="medium"
                    onClick={() => downloadChart(chartRef, chartKey)}
                    sx={{ textTransform: "none" }}
                >
                    {t("Download_Chart")}
                </Button>
            </Box>
        </Box>
    );
};

export { ChartCard };
