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

/** ----------------------------- Layout ----------------------------- */
// Baseline of the microorganism title, and the top padding that keeps the band
// above it clear so the legend always starts below the title.
const TITLE_BASELINE = 28;
const TITLE_BAND = 44;
// Below this many pixels per bar, comparing combinations gets unreadable, so
// the card grows instead of squeezing the bars.
const MIN_BAR_PX = 16;
const BASE_CARD_HEIGHT = 620;
// Card height outside the plotted rows: title, legend, x-axis, button.
const CARD_CHROME_PX = 260;

/** ----------------------------- Title plugin ----------------------------- */
const customTitlePlugin = (microName: string | null): Plugin => ({
    id: "customTitle",
    beforeDraw(chart: ChartJS) {
        const { ctx, width } = chart;
        if (!microName) return;

        const formattedWords: WordObject[] =
            formatMicroorganismNameArray(microName);

        // A fixed band at the top of the canvas, kept free by the layout's top
        // padding: anchoring to chartArea.top collided with the legend as soon
        // as several combinations wrapped it onto a second row.
        const titleYPosition = TITLE_BASELINE;

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

    // Every year row is equally tall, so size the rows for the busiest year:
    // the most combinations with data in any one year (skipNull leaves no
    // slot for a combination without data).
    const barsInBusiestYear = Math.max(
        1,
        ...yearsDesc.map(
            (year) => series.filter(({ data }) => data[year]).length
        )
    );
    const cardHeight = Math.max(
        BASE_CARD_HEIGHT,
        CARD_CHROME_PX + yearsDesc.length * barsInBusiestYear * MIN_BAR_PX
    );

    return (
        <Box
            sx={{
                backgroundColor: "white",
                height: `${cardHeight}px`,
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
                        // ✅ Force y to be the category label (string). A year
                        // this combination has no data for is a null value, not
                        // a 0 % bar: "not sampled" must not read as "0 % positive".
                        data: yearsDesc.map((year) =>
                            data[year]
                                ? { ...data[year], y: String(year) }
                                : { x: null, y: String(year) }
                        ) as unknown as ChartDataPoint[],
                        backgroundColor: colorForIndex(index),
                        // Let the compared bars fill most of each year row, and
                        // give a year's row only to the combinations it has data
                        // for (skipNull) instead of leaving empty slots.
                        categoryPercentage: 0.9,
                        barPercentage: 0.95,
                        // Capped so a lone bar is not much thicker than the
                        // bars of a busy year.
                        maxBarThickness: 22,
                        skipNull: true,
                    })),
                }}
                options={{
                    indexAxis: "y",
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: TITLE_BAND,
                            bottom: 15,
                            left: 0,
                            right: 0,
                        },
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
