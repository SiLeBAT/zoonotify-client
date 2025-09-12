import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
// eslint-disable-next-line import/named
import { Chart as ChartJS, TooltipItem, Plugin } from "chart.js";
import InsertLinkIcon from "@mui/icons-material/InsertLink";

import {
    errorBarTooltipPlugin,
    drawErrorBars,
    whiteBackgroundAndLogoPlugin,
} from "./chartPlugins";
import { useTranslation } from "react-i18next";
import { ChartDataPoint } from "./types";
import { formatMicroorganismNameArray, WordObject } from "./utils";

const generateColorFromKey = (key: string): string => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
};

const customTitlePlugin = (microName: string | null): Plugin => ({
    id: "customTitle",
    beforeDraw(chart: ChartJS) {
        const { ctx, chartArea, width } = chart;
        if (!microName) return;
        const formattedWords: WordObject[] =
            formatMicroorganismNameArray(microName);
        const titleYPosition = chartArea.top - 60;
        ctx.save();
        ctx.textAlign = "left";
        ctx.fillStyle = "black";
        let xPosition =
            (width -
                formattedWords.reduce((acc, { text, italic }) => {
                    ctx.font = italic
                        ? "italic bold 21px Arial"
                        : "bold 21px Arial";
                    return acc + ctx.measureText(text).width + 1;
                }, 0)) /
            2;

        formattedWords.forEach(({ text, italic }) => {
            ctx.font = italic ? "italic bold 21px Arial" : "bold 21px Arial";
            ctx.fillText(text, xPosition, titleYPosition);
            xPosition += ctx.measureText(text).width + 1;
        });
        ctx.restore();
    },
});

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
    const [copied, setCopied] = React.useState(false);

    const handleShareLink = async (): Promise<void> => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = url;
            ta.setAttribute("readonly", "");
            ta.style.position = "absolute";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand("copy");
            } catch {}
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
    };

    const chartColor = generateColorFromKey(chartKey);

    return (
        <Box
            sx={{
                backgroundColor: "white",
                height: "620px",
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
                        padding: { top: 40, bottom: 0, left: 0, right: 0 },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: t("Prevalence %"),
                                color: "black",
                                font: { size: 17, weight: "bold" },
                            },
                            beginAtZero: true,
                            max: xAxisMax,
                            ticks: { color: "black", font: { size: 14 } },
                        },
                        y: {
                            title: {
                                display: true,
                                text: t("Year"),
                                color: "black",
                                font: { size: 17, weight: "bold" },
                            },
                            reverse: false,
                            ticks: {
                                color: "black",
                                font: { size: 13 },
                                callback: function (_, index) {
                                    return yearOptions[index];
                                },
                            },
                        },
                    },
                    plugins: {
                        title: { display: false },
                        legend: {
                            labels: { color: "black", font: { size: 14 } },
                            position: "top",
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
                        customTexts: { generatedOn: t("Generated on") },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any,
                    animation: false,
                }}
                plugins={[
                    errorBarTooltipPlugin,
                    customTitlePlugin(currentMicroorganism),
                    {
                        id: "customErrorBars",
                        afterDraw: (chart: ChartJS) => drawErrorBars(chart),
                    },
                    whiteBackgroundAndLogoPlugin(prevalenceUpdateDate),
                ]}
                ref={chartRef}
            />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    marginTop: 2,
                    flexWrap: "wrap",
                }}
            >
                <Button
                    variant="contained"
                    size="medium"
                    onClick={() => downloadChart(chartRef, chartKey)}
                    sx={{ textTransform: "none" }}
                >
                    {t("Download_Chart")}
                </Button>

                <Button
                    variant="contained"
                    size="medium"
                    onClick={handleShareLink}
                    startIcon={<InsertLinkIcon />}
                    sx={{ textTransform: "none" }}
                >
                    {t("Share_Link")}
                </Button>
            </Box>

            {copied && (
                <Typography
                    color="success.main"
                    textAlign="center"
                    mt={1}
                    fontWeight="bold"
                >
                    {t("Link copied to clipboard!") ||
                        "Link copied to clipboard!"}
                </Typography>
            )}
        </Box>
    );
};

export { ChartCard };
