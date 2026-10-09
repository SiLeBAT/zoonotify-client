import {
    Box,
    CircularProgress,
    Grid,
    Pagination,
    Slider,
    Typography,
    useMediaQuery,
} from "@mui/material";
import type { ChartConfiguration } from "chart.js";
import { Chart as ChartJS, registerables } from "chart.js";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChartCard } from "./ChartCard";
import { MicroorganismSelect } from "./MicroorganismSelect";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import { ChartDataPoint } from "./types";
import { getCurrentTimestamp } from "./utils";

ChartJS.register(...registerables);

const PrevalenceChart: React.FC = () => {
    const {
        prevalenceData,
        loading,
        prevalenceUpdateDate,
        selectedChartMicroorganism,
        setSelectedChartMicroorganism,
    } = usePrevalenceFilters();

    const chartRefs = useRef<{
        [key: string]: React.RefObject<
            ChartJS<"bar", ChartDataPoint[], unknown>
        >;
    }>({});

    const { t } = useTranslation(["PrevalencePage"]);

    const [availableMicroorganisms, setAvailableMicroorganisms] = useState<
        string[]
    >([]);
    const [currentPage, setCurrentPage] = useState(1);

    /**
     * Chart year window — a view-only range over the chart's year (y) axis.
     * Ephemeral: it only reframes the charts (and the WYSIWYG figure export),
     * never the table or the CSV "Data download". `null` means "full span".
     * See docs/context/prevalence-visualization.md (monorepo root).
     */
    const [chartYearRange, setChartYearRange] = useState<
        [number, number] | null
    >(null);

    /** Distinct years the selected microorganism actually has data for. */
    const microYears = useMemo(() => {
        const years = prevalenceData
            .filter(
                (entry) => entry.microorganism === selectedChartMicroorganism
            )
            .map((entry) => entry.samplingYear)
            .filter(Number.isFinite);
        return Array.from(new Set(years)).sort((a, b) => a - b);
    }, [prevalenceData, selectedChartMicroorganism]);

    const microYearMin = microYears[0];
    const microYearMax = microYears[microYears.length - 1];

    // The active window: an explicit selection, else the micro's full span.
    const activeRange: [number, number] = chartYearRange ?? [
        microYearMin,
        microYearMax,
    ];

    /**
     * Tick marks for the year slider: one tick per year that actually has
     * data. Labels are thinned to at most ~10 so they stay readable on long
     * spans; the first and last year are always labelled so the bounds of the
     * window are legible without dragging.
     */
    const yearMarks = useMemo(() => {
        if (microYears.length < 2) return [];
        const labelEvery = Math.ceil(microYears.length / 10);
        return microYears.map((year, index) => ({
            value: year,
            label:
                index === 0 ||
                index === microYears.length - 1 ||
                index % labelEvery === 0
                    ? String(year)
                    : undefined,
        }));
    }, [microYears]);

    // Reset the window to full span whenever the plotted microorganism or its
    // year bounds change (microorganism switch or a fresh search). `null` = full.
    useEffect(() => {
        setChartYearRange(null);
    }, [selectedChartMicroorganism, microYearMin, microYearMax]);

    const chartsPerPage = 2;
    const isSmallScreen = useMediaQuery("(max-width:1600px)");

    const updateAvailableMicroorganisms = (): void => {
        const microorganismsWithData = Array.from(
            new Set(prevalenceData.map((entry) => entry.microorganism))
        ).filter(Boolean);

        setAvailableMicroorganisms(microorganismsWithData);

        if (
            microorganismsWithData.length > 0 &&
            (!selectedChartMicroorganism ||
                !microorganismsWithData.includes(selectedChartMicroorganism))
        ) {
            setSelectedChartMicroorganism(microorganismsWithData[0]);
        }
    };

    useEffect(() => {
        if (prevalenceData.length > 0) updateAvailableMicroorganisms();
    }, [prevalenceData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedChartMicroorganism]);

    const generateChartData = (): {
        [key: string]: { [key: number]: ChartDataPoint };
    } => {
        const chartData: { [key: string]: { [key: number]: ChartDataPoint } } =
            {};

        prevalenceData.forEach((entry) => {
            if (entry.microorganism === selectedChartMicroorganism) {
                const key = `${entry.sampleOrigin}-${entry.matrix}-${entry.samplingStage}`;
                if (!chartData[key]) chartData[key] = {};
                chartData[key][entry.samplingYear] = {
                    x: entry.percentageOfPositive,
                    y: entry.samplingYear,
                    ciMin: entry.ciMin,
                    ciMax: entry.ciMax,
                    numberOfSamples: entry.numberOfSamples,
                    numberOfPositive: entry.numberOfPositive,
                };
            }
        });

        return chartData;
    };

    const chartData = generateChartData();
    const chartKeys = Object.keys(chartData);
    const totalCharts = chartKeys.length;
    const totalPages = Math.ceil(totalCharts / chartsPerPage);

    const displayedChartsSet = new Set(
        chartKeys.slice(
            (currentPage - 1) * chartsPerPage,
            currentPage * chartsPerPage
        )
    );

    const [rangeLo, rangeHi] = activeRange;

    /**
     * Years shown on the charts = the selected microorganism's years that fall
     * inside the Chart year window. Intersection (not a contiguous fill), so a
     * non-contiguous left-panel year filter is respected and years the micro has
     * no data for drop out rather than showing as empty rows.
     */
    const yearsToShow = useMemo(
        () => microYears.filter((y) => y >= rangeLo && y <= rangeHi),
        [microYears, rangeLo, rangeHi]
    );

    // The prevalence-% axis rescales to the Chart year window: only CIs of years
    // currently visible count. Zooming to low-prevalence years gives more detail,
    // and because the PNG "Download chart" figure is WYSIWYG it captures this
    // rescaled axis — while the CSV "Data download" stays full and unaffected.
    const visibleYears = new Set(yearsToShow);
    const allCiMaxValues = Object.values(chartData).flatMap((yearData) =>
        Object.entries(yearData)
            .filter(([year]) => visibleYears.has(Number(year)))
            .map(([, data]) => data.ciMax)
    );
    const maxCiPlus = Math.max(...allCiMaxValues);
    const xAxisMax = maxCiPlus > 25 ? 100 : 25;

    const sanitizeKey = (key: string): string => {
        return key.replace(/[^a-z0-9_\-]/gi, "_");
    };

    const downloadChart = async (
        chartRef: React.RefObject<ChartJS<"bar", ChartDataPoint[], unknown>>,
        chartKey: string
    ): Promise<void> => {
        if (!chartRef.current) {
            console.error("Chart reference is undefined");
            return;
        }
        const originalChart = chartRef.current;

        const canvasWidth = 1380;
        const canvasHeight = 1000;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;

        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) {
            console.error("Failed to get temp canvas context");
            return;
        }

        tempCtx.fillStyle = "white";
        tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        const originalConfig = originalChart.config;

        const clonedConfig: ChartConfiguration<
            "bar",
            ChartDataPoint[],
            unknown
        > = {
            type: "bar",
            data: { ...originalConfig.data },
            options: {
                ...originalConfig.options,
                responsive: false,
                devicePixelRatio: 1,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                animation: false as any,
                layout: {
                    padding: { top: 60, bottom: 40, left: 60, right: 80 },
                },
                scales: {
                    x: {
                        ...originalConfig.options?.scales?.x,
                        ticks: {
                            ...originalConfig.options?.scales?.x?.ticks,
                            font: { size: 20 },
                            color: "black",
                        },
                        title: {
                            ...originalConfig.options?.scales?.x?.title,
                            display: true,
                            text: t("Prevalence %"),
                            color: "black",
                            font: { size: 22, weight: "bold" },
                        },
                    },
                    y: {
                        ...originalConfig.options?.scales?.y,
                        ticks: {
                            ...originalConfig.options?.scales?.y?.ticks,
                            font: { size: 22 },
                            color: "black",
                        },
                        title: {
                            ...originalConfig.options?.scales?.y?.title,
                            display: true,
                            text: t("Year"),
                            color: "black",
                            font: { size: 24, weight: "bold" },
                        },
                    },
                },
                plugins: {
                    ...originalConfig.options?.plugins,
                    legend: {
                        ...originalConfig.options?.plugins?.legend,
                        labels: {
                            ...originalConfig.options?.plugins?.legend?.labels,
                            color: "black",
                            font: { size: 20 },
                        },
                    },
                },
            },
            plugins: originalConfig.plugins,
        };

        tempCtx.save();
        const tempChart = new ChartJS(tempCtx, clonedConfig);
        await tempChart.update();
        tempCtx.restore();

        const link = document.createElement("a");
        const sanitizedChartKey = sanitizeKey(chartKey);
        link.href = tempCanvas.toDataURL("image/png", 1.0);
        link.download = `${sanitizedChartKey}-${getCurrentTimestamp()}.png`;
        link.click();

        tempChart.destroy();
    };

    return (
        <Box sx={{ padding: 0, position: "relative", minHeight: "100vh" }}>
            {/* ✅ Sticky top controls (dropdown + slider same width container) */}
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                    padding: 2,
                    backgroundColor: "rgb(219, 228, 235)",
                    overflow: "visible",
                }}
            >
                <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%" }}>
                    <MicroorganismSelect
                        currentMicroorganism={selectedChartMicroorganism}
                        availableMicroorganisms={availableMicroorganisms}
                        setCurrentMicroorganism={setSelectedChartMicroorganism}
                    />
                    {microYears.length >= 2 && (
                        <Box sx={{ px: 1, mt: 1 }}>
                            <Typography
                                id="chart-year-range-label"
                                variant="caption"
                                component="label"
                                sx={{
                                    display: "block",
                                    color: "text.secondary",
                                    fontWeight: 500,
                                }}
                            >
                                {t("Chart_Year_Range")}
                            </Typography>
                            <Slider
                                size="small"
                                value={activeRange}
                                min={microYearMin}
                                max={microYearMax}
                                step={1}
                                marks={yearMarks}
                                valueLabelDisplay="auto"
                                aria-labelledby="chart-year-range-label"
                                onChange={(_, value) =>
                                    setChartYearRange(value as [number, number])
                                }
                                sx={{
                                    // Room for the year tick labels below the
                                    // rail; the value balloons only appear on
                                    // hover/drag, so no extra space above.
                                    mt: 1,
                                    mb: 3,
                                    "& .MuiSlider-markLabel": {
                                        fontSize: "0.7rem",
                                        color: "text.secondary",
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    {Object.keys(chartData).length === 0 ? (
                        <Typography variant="h6">
                            {t("No_data_available")}
                        </Typography>
                    ) : (
                        <>
                            <Grid container rowSpacing={0} columnSpacing={2}>
                                {chartKeys.map((key, index) => {
                                    const sanitizedKey = sanitizeKey(key);
                                    const refKey = `${sanitizedKey}-${selectedChartMicroorganism}`;

                                    if (!chartRefs.current[refKey]) {
                                        chartRefs.current[refKey] =
                                            React.createRef<
                                                ChartJS<
                                                    "bar",
                                                    ChartDataPoint[],
                                                    unknown
                                                >
                                            >();
                                    }

                                    const isDisplayed =
                                        displayedChartsSet.has(key);

                                    return (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={12}
                                            md={isSmallScreen ? 12 : 6}
                                            lg={isSmallScreen ? 12 : 6}
                                            key={refKey}
                                            sx={{
                                                visibility: isDisplayed
                                                    ? "visible"
                                                    : "hidden",
                                                height: isDisplayed
                                                    ? "auto"
                                                    : 0,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <ChartCard
                                                chartKey={key}
                                                colorIndex={index}
                                                chartData={chartData[key]}
                                                chartRef={
                                                    chartRefs.current[refKey]
                                                }
                                                currentMicroorganism={
                                                    selectedChartMicroorganism
                                                }
                                                yearsToShow={yearsToShow}
                                                xAxisMax={xAxisMax}
                                                downloadChart={downloadChart}
                                                prevalenceUpdateDate={
                                                    prevalenceUpdateDate
                                                }
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            <Box
                                sx={{
                                    position: "sticky",
                                    bottom: 0,
                                    zIndex: 1000,
                                    padding: 2,
                                    backgroundColor: "rgb(219, 228, 235)",
                                }}
                            >
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={(_, value) =>
                                        setCurrentPage(value)
                                    }
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                />
                            </Box>
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

export { PrevalenceChart };
