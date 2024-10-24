import React, { useRef, useState, useEffect } from "react";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import {
    Box,
    CircularProgress,
    Typography,
    Grid,
    Button,
    Pagination,
} from "@mui/material";
import { Chart as ChartJS, registerables } from "chart.js";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";
import { MicroorganismSelect } from "./MicroorganismSelect";
import { ChartCard } from "./ChartCard";
import { getCurrentTimestamp, formatMicroorganismNameArray } from "./utils"; // Import the formatting function
import { ChartDataPoint } from "./types";

ChartJS.register(...registerables);

const PrevalenceChart: React.FC = () => {
    const { prevalenceData, loading } = usePrevalenceFilters();
    const chartRefs = useRef<{
        [key: string]: React.RefObject<
            ChartJS<"bar", ChartDataPoint[], unknown>
        >;
    }>({});
    const { t } = useTranslation(["PrevalencePage"]);
    const [currentMicroorganism, setCurrentMicroorganism] = useState<
        string | null
    >(null);
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

    // Clear chartRefs when currentMicroorganism changes
    useEffect(() => {
        chartRefs.current = {};
    }, [currentMicroorganism]);

    const yearOptions = Array.from(
        { length: 14 },
        (_, i) => 2009 + i
    ).reverse();

    const generateChartData = (): {
        [key: string]: { [key: number]: ChartDataPoint };
    } => {
        const chartData: { [key: string]: { [key: number]: ChartDataPoint } } =
            {};
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
        const chartInstance = chartRef.current;
        const microorganismName = currentMicroorganism;

        if (chartInstance) {
            await chartInstance.update();

            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => {
                    const canvas = chartInstance.canvas;

                    if (canvas && canvas.width > 0 && canvas.height > 0) {
                        // Increase resolution with scale factor
                        const scaleFactor = 2; // Adjust for higher resolution

                        const tempCanvas = document.createElement("canvas");
                        const tempCtx = tempCanvas.getContext("2d");

                        const extraHeight = 60 * scaleFactor;
                        tempCanvas.width = canvas.width * scaleFactor;
                        tempCanvas.height =
                            (canvas.height + extraHeight) * scaleFactor;

                        if (tempCtx) {
                            // Scale up the context for higher resolution
                            tempCtx.scale(scaleFactor, scaleFactor);
                            tempCtx.fillStyle = "white";
                            tempCtx.fillRect(
                                0,
                                0,
                                tempCanvas.width,
                                tempCanvas.height
                            );

                            // Apply black font and larger size
                            if (microorganismName) {
                                const titleFontSize = 10 * scaleFactor;

                                const wordsArray =
                                    formatMicroorganismNameArray(
                                        microorganismName
                                    );
                                const wordMeasurements = wordsArray.map(
                                    (wordObj) => {
                                        tempCtx.font = `${
                                            wordObj.italic ? "italic" : "normal"
                                        } ${titleFontSize}px Arial`;
                                        const width = tempCtx.measureText(
                                            wordObj.text
                                        ).width;
                                        return { ...wordObj, width };
                                    }
                                );

                                const totalWidth = wordMeasurements.reduce(
                                    (sum, wordObj) => sum + wordObj.width,
                                    0
                                );

                                let xPos =
                                    (tempCanvas.width / scaleFactor -
                                        totalWidth) /
                                    2;
                                const yPos = titleFontSize + 10;

                                wordMeasurements.forEach((wordObj) => {
                                    tempCtx.font = `${
                                        wordObj.italic ? "italic" : "normal"
                                    } ${titleFontSize}px Arial`;
                                    tempCtx.fillStyle = "black";
                                    tempCtx.fillText(wordObj.text, xPos, yPos);
                                    xPos += wordObj.width;
                                });
                            }

                            tempCtx.drawImage(
                                canvas,
                                0,
                                extraHeight / scaleFactor
                            );

                            const link = document.createElement("a");
                            const sanitizedChartKey = sanitizeKey(chartKey);
                            link.href = tempCanvas.toDataURL("image/png");
                            link.download = `${sanitizedChartKey}-${getCurrentTimestamp()}.png`;
                            link.click();
                        } else {
                            console.error("Failed to get temp canvas context");
                        }
                    } else {
                        console.error("Canvas has invalid dimensions");
                    }
                    resolve();
                });
            });
        } else {
            console.error("Chart instance is undefined");
        }
    };
    const downloadAllCharts = async (): Promise<void> => {
        const zip = new JSZip();
        const timestamp = getCurrentTimestamp();
        const microorganismName = currentMicroorganism; // Capture the current microorganism name

        const chartPromises = Object.keys(chartRefs.current).map(
            async (key) => {
                const chartRef = chartRefs.current[key];
                const chartInstance = chartRef.current;

                if (chartInstance) {
                    await chartInstance.update();

                    await new Promise<void>((resolve) => {
                        requestAnimationFrame(() => {
                            const canvas = chartInstance.canvas;

                            if (
                                canvas &&
                                canvas.width > 0 &&
                                canvas.height > 0
                            ) {
                                const tempCanvas =
                                    document.createElement("canvas");
                                const tempCtx = tempCanvas.getContext("2d");

                                const extraHeight = 60;
                                tempCanvas.width = canvas.width;
                                tempCanvas.height = canvas.height + extraHeight;

                                if (tempCtx) {
                                    tempCtx.fillStyle = "white";
                                    tempCtx.fillRect(
                                        0,
                                        0,
                                        tempCanvas.width,
                                        tempCanvas.height
                                    );

                                    if (microorganismName) {
                                        const titleFontSize = 20;

                                        // Use the formatting function
                                        const wordsArray =
                                            formatMicroorganismNameArray(
                                                microorganismName
                                            );

                                        // Measure each word and calculate total width
                                        const wordMeasurements = wordsArray.map(
                                            (wordObj) => {
                                                tempCtx.font = `${
                                                    wordObj.italic
                                                        ? "italic"
                                                        : "normal"
                                                } ${titleFontSize}px Arial`;
                                                const width =
                                                    tempCtx.measureText(
                                                        wordObj.text
                                                    ).width;
                                                return { ...wordObj, width };
                                            }
                                        );

                                        const totalWidth =
                                            wordMeasurements.reduce(
                                                (sum, wordObj) =>
                                                    sum + wordObj.width,
                                                0
                                            );

                                        let xPos =
                                            (tempCanvas.width - totalWidth) / 2;
                                        const yPos = titleFontSize + 10;

                                        // Draw each word with appropriate styling
                                        wordMeasurements.forEach((wordObj) => {
                                            tempCtx.font = `${
                                                wordObj.italic
                                                    ? "italic"
                                                    : "normal"
                                            } ${titleFontSize}px Arial`;
                                            tempCtx.fillStyle = "black";
                                            tempCtx.fillText(
                                                wordObj.text,
                                                xPos,
                                                yPos
                                            );
                                            xPos += wordObj.width;
                                        });
                                    }

                                    tempCtx.drawImage(canvas, 0, extraHeight);

                                    const base64Image = tempCanvas
                                        .toDataURL("image/png")
                                        .split(",")[1];

                                    const sanitizedKey = sanitizeKey(key);

                                    zip.file(
                                        `${sanitizedKey}-${timestamp}.png`,
                                        base64Image,
                                        {
                                            base64: true,
                                        }
                                    );
                                } else {
                                    console.error(
                                        "Failed to get temp canvas context"
                                    );
                                }
                            } else {
                                console.error(
                                    `Canvas has invalid dimensions for chart ${key}`
                                );
                            }
                            resolve();
                        });
                    });
                } else {
                    console.error(
                        `Chart instance is undefined for chart ${key}`
                    );
                }
            }
        );

        await Promise.all(chartPromises);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `charts-${timestamp}.zip`);
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
                                    // Use the sanitized key only for chartRefs and filenames
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
                                                chartKey={key} // Use the original key for display
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
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            {/* Pagination */}
                            <Box
                                sx={{
                                    position: "sticky",
                                    bottom: "80px",
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

                            {/* Download All Charts Button */}
                            <Box
                                sx={{
                                    position: "sticky",
                                    bottom: 0,
                                    color: "inherit",
                                    textAlign: "center",
                                    zIndex: 1000,
                                    padding: 2,
                                    backgroundColor: "rgb(219, 228, 235)",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    onClick={downloadAllCharts}
                                    sx={{ width: "100%", height: "60px" }}
                                >
                                    {t("Download_All_Charts")}
                                </Button>
                            </Box>
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

export { PrevalenceChart };
