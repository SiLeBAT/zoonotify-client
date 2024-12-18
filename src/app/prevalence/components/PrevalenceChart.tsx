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

    const isBelow25Percent = Object.values(chartData)
        .flatMap((yearData) =>
            Object.values(yearData).every((data) => data.ciMax <= 25)
        )
        .every(Boolean);
    const xAxisMax = isBelow25Percent ? 25 : 100;

    // Sanitization function
    const sanitizeKey = (key: string): string => {
        return key.replace(/[^a-z0-9_\-]/gi, "_");
    };

    const downloadChart = async (
        chartRef: React.RefObject<ChartJS<"bar", ChartDataPoint[], unknown>>,
        chartKey: string
    ): Promise<void> => {
        if (!chartRef || !chartRef.current) {
            console.error("Chart reference is undefined");
            return;
        }

        const originalChart = chartRef.current;

        // Create a new canvas
        const scaleFactor = 1; // Adjust if you want higher resolution
        const extraHeight = 100; // Add extra height for spacing
        const canvasWidth = originalChart.width * scaleFactor;
        const canvasHeight = (originalChart.height + extraHeight) * scaleFactor;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;

        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) {
            console.error("Failed to get temp canvas context");
            return;
        }

        // Set background to white
        tempCtx.fillStyle = "white";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Clone the chart configuration
        const clonedConfig: ChartConfiguration = {
            type: "bar",
            data: originalChart.config.data,
            options: {
                ...originalChart.config.options,
                devicePixelRatio: scaleFactor,
                responsive: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                animation: false as any,
            },
            plugins: originalChart.config.plugins,
        };

        // Render the chart on the new canvas, offset by extraHeight
        tempCtx.save();
        tempCtx.translate(0, extraHeight / scaleFactor); // Offset chart rendering
        const tempChart = new ChartJS(tempCtx, clonedConfig);
        await tempChart.update();
        tempCtx.restore();

        // Export the canvas as an image
        const link = document.createElement("a");
        const sanitizedChartKey = sanitizeKey(chartKey);
        link.href = tempCanvas.toDataURL("image/png", 1.0);
        link.download = `${sanitizedChartKey}-${getCurrentTimestamp()}.png`;
        link.click();

        // Destroy the temporary chart to free up resources
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
