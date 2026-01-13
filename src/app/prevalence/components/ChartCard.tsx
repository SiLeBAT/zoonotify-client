import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Slider } from "@mui/material";
import { Bar } from "react-chartjs-2";
// eslint-disable-next-line import/named
import { Chart as ChartJS, TooltipItem, Plugin } from "chart.js";

import {
    errorBarTooltipPlugin,
    drawErrorBars,
    whiteBackgroundAndLogoPlugin,
} from "./chartPlugins";
import { useTranslation } from "react-i18next";
import { ChartDataPoint } from "./types";
import { formatMicroorganismNameArray, WordObject } from "./utils";

/** ----------------------------- Color helper ----------------------------- */
const generateColorFromKey = (key: string): string => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 60%)`;
};

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

/** -------------------------- Year slider (INLINE) ------------------------- */
type YearRangeSliderProps = {
    years: number[];
    selectedYears: number[];
    onChangeSelectedYears: (years: number[]) => void;
    label: string;
};

const YearRangeSlider: React.FC<YearRangeSliderProps> = ({
    years,
    selectedYears,
    onChangeSelectedYears,
    label,
}) => {
    const sortedYears = useMemo(
        () => [...(years ?? [])].filter(Number.isFinite).sort((a, b) => a - b),
        [years]
    );

    const minYear = sortedYears[0] ?? 0;
    const maxYear = sortedYears[sortedYears.length - 1] ?? 0;

    const yearSet = useMemo(() => new Set(sortedYears), [sortedYears]);

    const snapToValidYear = (y: number): number => {
        if (yearSet.has(y)) return y;

        let best = sortedYears[0] ?? y;
        let bestDist = Math.abs(best - y);
        for (const yy of sortedYears) {
            const d = Math.abs(yy - y);
            if (d < bestDist) {
                best = yy;
                bestDist = d;
            }
        }
        return best;
    };

    const derivedValue: [number, number] = useMemo(() => {
        if (!selectedYears || selectedYears.length === 0)
            return [minYear, maxYear];
        const s = [...selectedYears].sort((a, b) => a - b);
        const a = snapToValidYear(s[0]);
        const b = snapToValidYear(s[s.length - 1]);
        return a <= b ? [a, b] : [b, a];
    }, [selectedYears, minYear, maxYear, sortedYears]);

    const [temp, setTemp] = useState<[number, number]>(derivedValue);

    useEffect(() => {
        setTemp(derivedValue);
    }, [derivedValue]);

    const marks = useMemo(
        () => sortedYears.map((y) => ({ value: y })),
        [sortedYears]
    );

    const yearsInRange = (a: number, b: number): number[] => {
        const from = Math.min(a, b);
        const to = Math.max(a, b);
        return sortedYears.filter((y) => y >= from && y <= to);
    };

    if (!sortedYears.length) return null;

    return (
        // ✅ move slider UP: remove mt and reduce bottom spacing
        <Box sx={{ width: "100%", mt: 0, mb: 0.5 }}>
            <Box sx={{ fontSize: "0.9rem", mb: 0.2 }}>
                {label}: <b>{temp[0]}</b> — <b>{temp[1]}</b>
            </Box>

            <Slider
                value={temp}
                min={minYear}
                max={maxYear}
                step={1}
                marks={marks}
                track="normal"
                disableSwap
                valueLabelDisplay="auto"
                onChange={(_, v) => setTemp(v as [number, number])}
                onChangeCommitted={(_, v) => {
                    const [rawA, rawB] = v as [number, number];
                    const a = snapToValidYear(Math.round(rawA));
                    const b = snapToValidYear(Math.round(rawB));
                    onChangeSelectedYears(yearsInRange(a, b));
                }}
                sx={{
                    px: 0.5,
                    // ✅ slightly smaller to reduce height
                    "& .MuiSlider-thumb": { width: 16, height: 16 },
                    "& .MuiSlider-rail": {
                        opacity: 1,
                        height: 6,
                        borderRadius: 999,
                    },
                    "& .MuiSlider-track": { height: 6, borderRadius: 999 },
                    "& .MuiSlider-mark": {
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        transform: "translate(-50%, -50%)",
                        opacity: 1,
                    },
                    "& .MuiSlider-markActive": { opacity: 1 },
                }}
            />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    opacity: 0.8,
                    mt: 0, // ✅ was 0.3
                    px: 0.5,
                }}
            >
                <span>{minYear}</span>
                <span>{maxYear}</span>
            </Box>
        </Box>
    );
};

/** ------------------------------ Props ------------------------------ */
interface ChartCardProps {
    chartKey: string;
    chartData: { [year: number]: ChartDataPoint };
    chartRef: React.RefObject<ChartJS<"bar", ChartDataPoint[], unknown>>;
    currentMicroorganism: string | null;

    allYears: number[];
    selectedYears: number[];
    onChangeSelectedYears: (years: number[]) => void;

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
    chartData,
    chartRef,
    currentMicroorganism,
    allYears,
    selectedYears,
    onChangeSelectedYears,
    xAxisMax,
    downloadChart,
    prevalenceUpdateDate,
}) => {
    const { t } = useTranslation(["PrevalencePage"]);
    const chartColor = generateColorFromKey(chartKey);

    const yearsToShow = useMemo(() => {
        const base = selectedYears?.length ? selectedYears : allYears;
        return [...base].filter(Number.isFinite).sort((a, b) => a - b);
    }, [selectedYears, allYears]);

    return (
        <Box
            sx={{
                backgroundColor: "white",
                height: "620px",

                // ✅ reduce top padding so slider sits higher
                pt: 1, // was padding: 5
                px: 5,
                pb: 8,

                borderRadius: 2,
                boxShadow: 2,
                margin: "0 5px",
                position: "relative",
            }}
        >
            {/* ✅ Slider at TOP (now higher) */}
            <Box sx={{ mb: 0.6 }}>
                <YearRangeSlider
                    years={allYears ?? []}
                    selectedYears={selectedYears ?? []}
                    label={t("SAMPLING_YEAR")}
                    onChangeSelectedYears={onChangeSelectedYears}
                />
            </Box>

            <Bar
                data={{
                    labels: yearsToShow,
                    datasets: [
                        {
                            label: chartKey,
                            data: yearsToShow.map(
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

                    // ✅ reduce top padding a bit (still enough for title)
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
                                    return yearsToShow[index];
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
            </Box>
        </Box>
    );
};

export { ChartCard };
