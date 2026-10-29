import React, { useMemo } from "react";
import { Box, Button } from "@mui/material";
import { Bar } from "react-chartjs-2";
// eslint-disable-next-line import/named
import { Chart as ChartJS, TooltipItem, Plugin } from "chart.js";

import {
    errorBarTooltipPlugin,
    drawErrorBars,
    whiteBackgroundAndLogoPlugin,
} from "./chartPlugins";
import { useTranslation } from "react-i18next";
import { ChartDataPoint, ChartSeries } from "./types";
import { formatMicroorganismNameArray, WordObject } from "./utils";

/** ----------------------------- Color helper ----------------------------- */
// Curated, colourblind-safe palette (Okabe-Ito subset). Each combination in the
// graph is coloured by its position in the series list, not by hashing its key:
// consecutive palette entries guarantee the (at most four) compared combinations
// are visually distinct (the hash approach could land two on near-identical
// hues). Yellow/black from the full Okabe-Ito set are omitted as they read
// poorly as filled bars on a white card.
const CHART_PALETTE = [
    "#0072B2", // blue
    "#E69F00", // orange
    "#009E73", // green
    "#D55E00", // vermillion
    "#CC79A7", // purple
    "#56B4E9", // sky blue
];

const colorForIndex = (index: number): string =>
    CHART_PALETTE[index % CHART_PALETTE.length];

/** ----------------------------- Title plugin ----------------------------- */
const customTitlePlugin = (microName: string | null): Plugin => ({
    id: "customTitle",
    beforeDraw(chart: ChartJS) {
        const { ctx, chartArea, width } = chart;
        if (!microName) return;

        const formattedWords: WordObject[] =
            formatMicroorganismNameArray(microName);

        const titleYPosition = chartArea.top - 50;

        ctx.save();
        ctx.textAlign = "left";
        ctx.fillStyle = "black";

        let xPosition =
            (width -
                formattedWords.reduce((acc, { text, italic }) => {
                    ctx.font = italic
                        ? "italic bold 19px Arial"
                        : "bold 19px Arial";
                    return acc + ctx.measureText(text).width + 1;
                }, 0)) /
            2;

        formattedWords.forEach(({ text, italic }) => {
            ctx.font = italic ? "italic bold 19px Arial" : "bold 19px Arial";
            ctx.fillText(text, xPosition, titleYPosition);
            xPosition += ctx.measureText(text).width + 1;
        });

        ctx.restore();
    },
});

/** ------------------------------ Props ------------------------------ */
interface ChartCardProps {
    /** Names the PNG figure on "Download chart". */
    chartKey: string;
    /** One series per compared combination; its index drives the bar colour. */
    series: ChartSeries[];
    chartRef: React.RefObject<ChartJS<"bar", ChartDataPoint[], unknown>>;
    currentMicroorganism: string | null;

    yearsToShow: number[];

    xAxisMax: number;
    downloadChart: (
        chartRef: React.RefObject<ChartJS<"bar", ChartDataPoint[], unknown>>,
        chartKey: string
    ) => Promise<void>;
    prevalenceUpdateDate: string | null;
}

/** ------------------------------ Component ------------------------------ */
const ChartCard: React.FC<ChartCardProps> = ({
    chartKey,
    series,
    chartRef,
    currentMicroorganism,
    yearsToShow,
    xAxisMax,
    downloadChart,
    prevalenceUpdateDate,
}) => {
    const { t } = useTranslation(["PrevalencePage"]);

    // ✅ Latest year first (top)
    const yearsDesc = useMemo(
        () =>
            [...(yearsToShow ?? [])]
                .filter(Number.isFinite)
                .sort((a, b) => b - a),
        [yearsToShow]
    );

    // ✅ Make category labels strings
    const yearLabels = useMemo(() => yearsDesc.map(String), [yearsDesc]);

    return (
        <Box
            sx={{
                backgroundColor: "white",
                height: "620px",
                pt: 2,
                px: 5,
                pb: 8,
                borderRadius: 2,
                boxShadow: 2,
                margin: "0 5px",
                position: "relative",
            }}
        >
            <Bar
                data={{
                    labels: yearLabels,
                    datasets: series.map(({ label, data }, index) => ({
                        label,
                        data: yearsDesc.map((year) => {
                            const d =
                                data[year] ||
                                ({
                                    x: 0,
                                    y: String(year),
                                    ciMin: 0,
                                    ciMax: 0,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                } as any);

                            // ✅ Force y to be the category label (string)
                            return { ...d, y: String(year) };
                        }) as unknown as ChartDataPoint[],
                        backgroundColor: colorForIndex(index),
                    })),
                }}
                options={{
                    indexAxis: "y",
                    maintainAspectRatio: false,
                    layout: {
                        padding: { top: 30, bottom: 15, left: 0, right: 0 },
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
                            // ✅ Force category axis so labels are used
                            type: "category",
                            labels: yearLabels,

                            title: {
                                display: true,
                                text: t("Year"),
                                color: "black",
                                font: { size: 17, weight: "bold" },
                            },

                            // latest year already first in labels => keep reverse false
                            reverse: false,

                            ticks: {
                                color: "black",
                                font: { size: 13 },

                                // ✅ IMPORTANT: value is usually an index (0..n)
                                // so we must convert it to the label:
                                callback: function (value) {
                                    // "this" is the scale
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    return (this as any).getLabelForValue(
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        value as any
                                    );
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
                                        String(context.label ?? ""),
                                        10
                                    );
                                    const data =
                                        series[context.datasetIndex]?.data[
                                            year
                                        ] || {};
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const rawData = context.raw as any;

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
            </Box>
        </Box>
    );
};

export { ChartCard };
