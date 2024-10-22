import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js";
import { FormattedMicroorganismName } from "./FormattedMicroorganismName";
import {
    errorBarTooltipPlugin,
    drawErrorBars,
    logoPlugin,
} from "./chartPlugins";
import { useTranslation } from "react-i18next";

interface ChartDataPoint {
    x: number;
    y: number;
    ciMin: number;
    ciMax: number;
    numberOfSamples?: number;
    numberOfPositive?: number;
}

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
}

const ChartCard: React.FC<ChartCardProps> = ({
    chartKey,
    chartData,
    chartRef,
    currentMicroorganism,
    yearOptions,
    xAxisMax,
    downloadChart,
}) => {
    const { t } = useTranslation(["PrevalencePage"]);
    return (
        <Box
            sx={{
                backgroundColor: "white",
                padding: 4,
                borderRadius: 2,
                boxShadow: 2,
                margin: "0 15px",
            }}
        >
            <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{
                    minHeight: "60px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                }}
            >
                <FormattedMicroorganismName microName={currentMicroorganism} />
            </Typography>
            <Box sx={{ marginBottom: 4 }}>
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
                                backgroundColor: `#${Math.floor(
                                    Math.random() * 16777215
                                ).toString(16)}`,
                            },
                        ],
                    }}
                    options={{
                        indexAxis: "y",
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: t("Prevalence %"),
                                },
                                beginAtZero: true,
                                max: xAxisMax,
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: t("Year"),
                                },
                                reverse: false,
                                ticks: {
                                    callback: function (_, index) {
                                        return yearOptions[index];
                                    },
                                },
                            },
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    padding: 5,
                                },
                            },
                            tooltip: {
                                backgroundColor: "rgba(0, 0, 0, 1)",
                                titleFont: {
                                    size: 14,
                                },
                                bodyFont: {
                                    size: 12,
                                },
                                displayColors: true,
                                borderColor: "#fff",
                                borderWidth: 1,
                                caretPadding: 120,
                                yAlign: "center",
                                callbacks: {
                                    label: (context) => {
                                        const year = parseInt(
                                            context.label,
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
                        },
                        animation: false,
                    }}
                    plugins={[
                        errorBarTooltipPlugin,
                        {
                            id: "customErrorBars",
                            afterDraw: (chart: ChartJS) => drawErrorBars(chart),
                        },
                        logoPlugin,
                    ]}
                    ref={chartRef}
                />

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 2,
                    }}
                >
                    <Button
                        variant="contained"
                        size="medium"
                        onClick={() => downloadChart(chartRef, chartKey)}
                        sx={{
                            textTransform: "none",
                        }}
                    >
                        {t("Download_Chart")}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export { ChartCard };
