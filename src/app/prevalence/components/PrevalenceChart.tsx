import React, { useRef, useState, useEffect } from "react";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import {
    Box,
    CircularProgress,
    Typography,
    Grid,
    Pagination,
} from "@mui/material";
import { Chart as ChartJS, registerables } from "chart.js";
import type { ChartConfiguration } from "chart.js";
import { useTranslation } from "react-i18next";
import { MicroorganismSelect } from "./MicroorganismSelect";
import { ChartCard } from "./ChartCard";
import { getCurrentTimestamp } from "./utils";
import { ChartDataPoint } from "./types";

ChartJS.register(...registerables);

const PrevalenceChart: React.FC = () => {
    const { prevalenceData, loading, prevalenceUpdateDate } =
        usePrevalenceFilters();
    const chartRefs = useRef<{
        [key: string]: React.RefObject<
            ChartJS<"bar", ChartDataPoint[], unknown>
        >;
    }>({});
    const { t } = useTranslation(["PrevalencePage"]);
    const [currentMicroorganism, setCurrentMicroorganism] =
        useState<string>("");
    const [availableMicroorganisms, setAvailableMicroorganisms] = useState<
        string[]
    >([]);

    const [currentPage, setCurrentPage] = useState(1);
    const chartsPerPage = 2;

    const updateAvailableMicroorganisms = (): void => {
        const microorganismsWithData = Array.from(
            new Set(prevalenceData.map((entry) => entry.microorganism))
        );

        setAvailableMicroorganisms(microorganismsWithData);
        if (microorganismsWithData.length > 0 && !currentMicroorganism) {
            setCurrentMicroorganism(microorganismsWithData[0]);
        }
    };

    useEffect(() => {
        if (prevalenceData.length > 0) {
            updateAvailableMicroorganisms();
        }
    }, [prevalenceData]);

    useEffect(() => {
        if (
            currentMicroorganism &&
            !availableMicroorganisms.includes(currentMicroorganism)
        ) {
            setCurrentMicroorganism(availableMicroorganisms[0]);
        }
    }, [availableMicroorganisms]);

    // Reset pagination when the microorganism changes
    useEffect(() => {
        setCurrentPage(1);
    }, [currentMicroorganism]);

    const yearOptions = Array.from(
        { length: 15 },
        (_, i) => 2009 + i
    ).reverse();

    const generateChartData = (): {
        [key: string]: { [key: number]: ChartDataPoint };
    } => {
        const chartData: {
            [key: string]: { [key: number]: ChartDataPoint };
        } = {};
        prevalenceData.forEach((entry) => {
            if (entry.microorganism === currentMicroorganism) {
                const key = `${entry.sampleOrigin}-${entry.matrix}-${entry.samplingStage}`;
                if (!chartData[key]) {
                    chartData[key] = {};
                }
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

    // Gather all ciMax values from all chart data points
    const allCiMaxValues = Object.values(chartData).flatMap((yearData) =>
        Object.values(yearData).map((data) => data.ciMax)
    );

    // Get the highest ciMax value
    const maxCiPlus = Math.max(...allCiMaxValues);
    // If the highest CI+ value is greater than 25, set x-axis max to 100, otherwise 25
    const xAxisMax = maxCiPlus > 25 ? 100 : 25;

    // Sanitization function
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

        // Fixed rectangle dimension
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

        // Fill background with white
        tempCtx.fillStyle = "white";
        tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Clone the existing config
        const originalConfig = originalChart.config;
        const clonedConfig: ChartConfiguration<
            "bar",
            ChartDataPoint[],
            unknown
        > = {
            type: "bar",
            data: {
                ...originalConfig.data,
            },
            options: {
                ...originalConfig.options,
                responsive: false,
                devicePixelRatio: 1,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                animation: false as any,
                layout: {
                    padding: {
                        top: 60,
                        bottom: 40,
                        left: 60,
                        right: 80,
                    },
                },
                // Override axis label/tick sizes (from previous snippet)
                scales: {
                    x: {
                        ...originalConfig.options?.scales?.x,
                        ticks: {
                            ...originalConfig.options?.scales?.x?.ticks,
                            font: { size: 20 }, // Larger X ticks
                            color: "black",
                        },
                        title: {
                            ...originalConfig.options?.scales?.x?.title,
                            display: true,
                            text: "Prevalence (%)",
                            color: "black",
                            font: { size: 22, weight: "bold" },
                        },
                    },
                    y: {
                        ...originalConfig.options?.scales?.y,
                        ticks: {
                            ...originalConfig.options?.scales?.y?.ticks,
                            font: { size: 22 }, // Larger Y ticks
                            color: "black",
                        },
                        title: {
                            ...originalConfig.options?.scales?.y?.title,
                            display: true,
                            text: "Year",
                            color: "black",
                            font: { size: 24, weight: "bold" },
                        },
                    },
                },

                // Now override the built-in title + legend fonts
                plugins: {
                    ...originalConfig.options?.plugins,
                    // 1) Chart.js built-in title plugin

                    // 2) Legend labels
                    legend: {
                        ...originalConfig.options?.plugins?.legend,
                        labels: {
                            ...originalConfig.options?.plugins?.legend?.labels,
                            color: "black",
                            font: {
                                size: 20, // <-- Increase legend text size
                            },
                        },
                    },
                },
            },
            plugins: originalConfig.plugins,
        };

        // Render on the temp canvas
        tempCtx.save();
        const tempChart = new ChartJS(tempCtx, clonedConfig);
        await tempChart.update();
        tempCtx.restore();

        // Export as PNG
        const link = document.createElement("a");
        const sanitizedChartKey = sanitizeKey(chartKey);
        link.href = tempCanvas.toDataURL("image/png", 1.0);
        link.download = `${sanitizedChartKey}-${getCurrentTimestamp()}.png`;
        link.click();

        // Cleanup
        tempChart.destroy();
    };
    return (
        <Box sx={{ padding: 0, position: "relative", minHeight: "100vh" }}>
            {/* Top form control */}
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                    padding: 2,
                    backgroundColor: "rgb(219, 228, 235)",
                }}
            >
                <MicroorganismSelect
                    currentMicroorganism={currentMicroorganism}
                    availableMicroorganisms={availableMicroorganisms}
                    setCurrentMicroorganism={setCurrentMicroorganism}
                />
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
                            <Grid container spacing={0}>
                                {chartKeys.map((key) => {
                                    const sanitizedKey = sanitizeKey(key);
                                    const refKey = `${sanitizedKey}-${currentMicroorganism}`;
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
                                            md={6}
                                            lg={6}
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
                                                chartData={chartData[key]}
                                                chartRef={
                                                    chartRefs.current[refKey]
                                                }
                                                currentMicroorganism={
                                                    currentMicroorganism
                                                }
                                                yearOptions={yearOptions}
                                                xAxisMax={xAxisMax}
                                                downloadChart={downloadChart}
                                                prevalenceUpdateDate={
                                                    prevalenceUpdateDate
                                                } // Ensure this is passed
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            {/* Pagination */}
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
