import React, { useRef, useState, useEffect } from "react";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import {
    Box,
    CircularProgress,
    Typography,
    Grid,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Pagination,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";

ChartJS.register(...registerables);

const italicWords: string[] = [
    "Salmonella",
    "coli",
    "E.",
    "Bacillus",
    "cereus",
    "monocytogenes",
    "Clostridioides",
    "difficile",
    "Yersinia",
    "Listeria",
    "enterocolitica",
    "Vibrio",
    "Baylisascaris",
    "procyonis",
    "Echinococcus",
    "Campylobacter",
];

const formatMicroorganismNameArray = (
    microName: string | null | undefined
): { text: string; italic: boolean }[] => {
    if (!microName) {
        console.warn("Received null or undefined microorganism name");
        return [];
    }

    const words = microName
        .split(/([-\s])/)
        .filter((part: string) => part.length > 0);

    return words.map((word: string) => {
        if (word.trim() === "" || word === "-") {
            return { text: word, italic: false };
        }

        const italic = italicWords.some((italicWord: string) =>
            word.toLowerCase().includes(italicWord.toLowerCase())
        );

        return { text: word, italic };
    });
};

interface ChartDataPoint {
    x: number;
    y: number;
    ciMin: number;
    ciMax: number;
    numberOfSamples?: number;
    numberOfPositive?: number;
}

const getCurrentTimestamp = (): string => {
    const now = new Date();
    return now.toISOString().replace(/[-:.]/g, "");
};

const getFormattedDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString();
};

// Preload the logo image
const logoImage = new Image();
logoImage.src = "/assets/bfr_logo.png";

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

    const [currentPage, setCurrentPage] = useState(1); // For pagination
    const chartsPerPage = 2; // Number of charts to display per page

    const updateAvailableMicroorganisms = (): void => {
        // Extract unique microorganisms from prevalenceData
        const microorganismsWithData = Array.from(
            new Set(prevalenceData.map((entry) => entry.microorganism))
        );

        setAvailableMicroorganisms(microorganismsWithData);
        if (microorganismsWithData.length > 0 && !currentMicroorganism) {
            setCurrentMicroorganism(microorganismsWithData[0]);
        }
    };

    // Reset the currently selected microorganism if it's not in the available options
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

    const drawErrorBars = (chart: ChartJS): void => {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((bar, index) => {
                const dataPoint = dataset.data[index] as ChartDataPoint;
                if (dataPoint && (dataPoint.ciMin || dataPoint.ciMax)) {
                    const xMin = chart.scales.x.getPixelForValue(
                        dataPoint.ciMin
                    );
                    const xMax = chart.scales.x.getPixelForValue(
                        dataPoint.ciMax
                    );
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const y = (bar as any).y; // Type assertion to access 'y'

                    ctx.save();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(xMin, y);
                    ctx.lineTo(xMax, y);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(xMin, y - 5);
                    ctx.lineTo(xMin, y + 5);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(xMax, y - 5);
                    ctx.lineTo(xMax, y + 5);
                    ctx.stroke();

                    ctx.restore();
                }
            });
        });
    };

    const errorBarTooltipPlugin = {
        id: "customErrorBarsTooltip",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        afterEvent: (chart: ChartJS, args: { event: any }) => {
            const { event } = args;
            const tooltip = chart.tooltip;
            const mouseX = event.x;
            const mouseY = event.y;
            let foundErrorBar = false;

            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                    const dataPoint = dataset.data[index] as ChartDataPoint;
                    if (dataPoint && (dataPoint.ciMin || dataPoint.ciMax)) {
                        const xMin = chart.scales.x.getPixelForValue(
                            dataPoint.ciMin
                        );
                        const xMax = chart.scales.x.getPixelForValue(
                            dataPoint.ciMax
                        );
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const y = (bar as any).y; // Type assertion to access 'y'

                        if (
                            mouseX >= xMin &&
                            mouseX <= xMax &&
                            Math.abs(mouseY - y) < 5
                        ) {
                            if (
                                tooltip &&
                                typeof tooltip.setActiveElements === "function"
                            ) {
                                tooltip.setActiveElements(
                                    [
                                        {
                                            datasetIndex: i,
                                            index,
                                        },
                                    ],
                                    { x: mouseX, y: mouseY }
                                );
                            }
                            foundErrorBar = true;
                        }
                    }
                });
            });

            if (
                !foundErrorBar &&
                tooltip &&
                typeof tooltip.setActiveElements === "function"
            ) {
                tooltip.setActiveElements([], { x: 0, y: 0 });
            }
        },
    };

    const downloadChart = async (
        chartRef: React.RefObject<ChartJS<"bar", ChartDataPoint[], unknown>>,
        chartKey: string
    ): Promise<void> => {
        const chartInstance = chartRef.current;

        if (chartInstance) {
            // Ensure the chart is updated
            await chartInstance.update();

            // Use requestAnimationFrame to wait until the next repaint
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => {
                    const canvas = chartInstance.canvas;

                    if (canvas && canvas.width > 0 && canvas.height > 0) {
                        // Create a temporary canvas
                        const tempCanvas = document.createElement("canvas");
                        const tempCtx = tempCanvas.getContext("2d");

                        const extraHeight = 60; // Adjust to accommodate the title
                        tempCanvas.width = canvas.width;
                        tempCanvas.height = canvas.height + extraHeight;

                        if (tempCtx) {
                            // Fill background with white
                            tempCtx.fillStyle = "white";
                            tempCtx.fillRect(
                                0,
                                0,
                                tempCanvas.width,
                                tempCanvas.height
                            );

                            // Draw the title
                            if (currentMicroorganism) {
                                const titleWords =
                                    formatMicroorganismNameArray(
                                        currentMicroorganism
                                    );

                                const titleFontSize = 20;
                                tempCtx.font = `${titleFontSize}px Arial`;

                                // Measure total width
                                let totalWidth = 0;
                                titleWords.forEach((wordObj) => {
                                    tempCtx.font = wordObj.italic
                                        ? `italic ${titleFontSize}px Arial`
                                        : `${titleFontSize}px Arial`;
                                    totalWidth += tempCtx.measureText(
                                        wordObj.text
                                    ).width;
                                });

                                // Center the title
                                let xPos = (tempCanvas.width - totalWidth) / 2;
                                const yPos = titleFontSize + 10; // Add some padding

                                // Draw each word with formatting
                                titleWords.forEach((wordObj) => {
                                    tempCtx.font = wordObj.italic
                                        ? `italic ${titleFontSize}px Arial`
                                        : `${titleFontSize}px Arial`;
                                    tempCtx.fillStyle = "black";
                                    tempCtx.fillText(wordObj.text, xPos, yPos);
                                    xPos += tempCtx.measureText(
                                        wordObj.text
                                    ).width;
                                });
                            }

                            // Draw the chart onto the temp canvas
                            tempCtx.drawImage(canvas, 0, extraHeight);

                            // Save the temp canvas as the image
                            const link = document.createElement("a");
                            link.href = tempCanvas.toDataURL("image/png");
                            link.download = `${chartKey}-${getCurrentTimestamp()}.png`;
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

        const chartPromises = Object.keys(chartRefs.current).map(
            async (key) => {
                const chartRef = chartRefs.current[key];
                const chartInstance = chartRef.current;

                if (chartInstance) {
                    // Ensure the chart is updated
                    await chartInstance.update();

                    // Use requestAnimationFrame to wait until the next repaint
                    await new Promise<void>((resolve) => {
                        requestAnimationFrame(() => {
                            const canvas = chartInstance.canvas;

                            if (
                                canvas &&
                                canvas.width > 0 &&
                                canvas.height > 0
                            ) {
                                // Create a temporary canvas
                                const tempCanvas =
                                    document.createElement("canvas");
                                const tempCtx = tempCanvas.getContext("2d");

                                const extraHeight = 60; // Adjust to accommodate the title
                                tempCanvas.width = canvas.width;
                                tempCanvas.height = canvas.height + extraHeight;

                                if (tempCtx) {
                                    // Fill background with white
                                    tempCtx.fillStyle = "white";
                                    tempCtx.fillRect(
                                        0,
                                        0,
                                        tempCanvas.width,
                                        tempCanvas.height
                                    );

                                    // Draw the title
                                    if (currentMicroorganism) {
                                        const titleWords =
                                            formatMicroorganismNameArray(
                                                currentMicroorganism
                                            );

                                        const titleFontSize = 20;
                                        tempCtx.font = `${titleFontSize}px Arial`;

                                        // Measure total width
                                        let totalWidth = 0;
                                        titleWords.forEach((wordObj) => {
                                            tempCtx.font = wordObj.italic
                                                ? `italic ${titleFontSize}px Arial`
                                                : `${titleFontSize}px Arial`;
                                            totalWidth += tempCtx.measureText(
                                                wordObj.text
                                            ).width;
                                        });

                                        // Center the title
                                        let xPos =
                                            (tempCanvas.width - totalWidth) / 2;
                                        const yPos = titleFontSize + 10; // Add some padding

                                        // Draw each word with formatting
                                        titleWords.forEach((wordObj) => {
                                            tempCtx.font = wordObj.italic
                                                ? `italic ${titleFontSize}px Arial`
                                                : `${titleFontSize}px Arial`;
                                            tempCtx.fillStyle = "black";
                                            tempCtx.fillText(
                                                wordObj.text,
                                                xPos,
                                                yPos
                                            );
                                            xPos += tempCtx.measureText(
                                                wordObj.text
                                            ).width;
                                        });
                                    }

                                    // Draw the chart onto the temp canvas
                                    tempCtx.drawImage(canvas, 0, extraHeight);

                                    // Save the temp canvas to zip
                                    const base64Image = tempCanvas
                                        .toDataURL("image/png")
                                        .split(",")[1];
                                    zip.file(
                                        `${key}-${timestamp}.png`,
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

    const logoPlugin = {
        id: "logoPlugin",
        beforeInit: (chart: ChartJS) => {
            // Preload the image if not already loaded
            if (!logoImage.complete) {
                logoImage.onload = () => {
                    chart.update();
                };
            }
        },
        beforeDraw: (chart: ChartJS) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        },
        afterDraw: (chart: ChartJS) => {
            if (logoImage.complete) {
                const ctx = chart.ctx;
                const extraPadding = 20;
                const logoWidth = 60;
                const logoHeight = 27;

                const logoX = chart.chartArea.left + 20;
                const logoY = chart.chartArea.bottom + extraPadding;

                ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);

                const dateText = `${t("Generated_on")}: ${getFormattedDate()}`;
                ctx.font = "10px Arial";
                ctx.fillStyle = "#000";
                ctx.textAlign = "right";
                ctx.fillText(dateText, chart.width - 10, chart.height - 5);
            }
        },
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
                <FormControl fullWidth sx={{ mb: 1 }} variant="outlined">
                    <InputLabel id="microorganism-select-label" shrink={true}>
                        {t("Select_Microorganism")}
                    </InputLabel>
                    <Select
                        labelId="microorganism-select-label"
                        value={currentMicroorganism || ""}
                        onChange={(event) =>
                            setCurrentMicroorganism(
                                event.target.value as string
                            )
                        }
                        label={t("Select_Microorganism")}
                        sx={{ backgroundColor: "#f5f5f5" }}
                        renderValue={(selected) => (
                            <Typography component="span">
                                {formatMicroorganismNameArray(selected).map(
                                    (wordObj, index) => (
                                        <React.Fragment key={index}>
                                            {wordObj.italic ? (
                                                <i>{wordObj.text}</i>
                                            ) : (
                                                wordObj.text
                                            )}
                                        </React.Fragment>
                                    )
                                )}
                            </Typography>
                        )}
                    >
                        {availableMicroorganisms.length > 0 ? (
                            availableMicroorganisms.map((microorganism) => (
                                <MenuItem
                                    key={microorganism}
                                    value={microorganism}
                                >
                                    <Typography component="span">
                                        {formatMicroorganismNameArray(
                                            microorganism
                                        ).map((wordObj, index) => (
                                            <React.Fragment key={index}>
                                                {wordObj.italic ? (
                                                    <i>{wordObj.text}</i>
                                                ) : (
                                                    wordObj.text
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </Typography>
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>
                                <Typography component="span">
                                    {t("No_Microorganisms_Available")}
                                </Typography>
                            </MenuItem>
                        )}
                    </Select>
                </FormControl>
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
                            <Grid container spacing={4}>
                                {chartKeys.map((key) => {
                                    const refKey = `${key}-${currentMicroorganism}`;
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

                                    // Determine if the chart should be displayed or hidden
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
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace: "normal",
                                                        wordWrap: "break-word",
                                                    }}
                                                >
                                                    {formatMicroorganismNameArray(
                                                        currentMicroorganism
                                                    ).map((wordObj, index) => (
                                                        <React.Fragment
                                                            key={index}
                                                        >
                                                            {wordObj.italic ? (
                                                                <i>
                                                                    {
                                                                        wordObj.text
                                                                    }
                                                                </i>
                                                            ) : (
                                                                wordObj.text
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </Typography>
                                                <Box sx={{ marginBottom: 4 }}>
                                                    <Bar
                                                        data={{
                                                            labels: yearOptions,
                                                            datasets: [
                                                                {
                                                                    label: key,
                                                                    data: yearOptions.map(
                                                                        (
                                                                            year
                                                                        ) =>
                                                                            chartData[
                                                                                key
                                                                            ]?.[
                                                                                year
                                                                            ] || {
                                                                                x: 0,
                                                                                y: year,
                                                                                ciMin: 0,
                                                                                ciMax: 0,
                                                                            }
                                                                    ) as ChartDataPoint[],
                                                                    backgroundColor: `#${Math.floor(
                                                                        Math.random() *
                                                                            16777215
                                                                    ).toString(
                                                                        16
                                                                    )}`,
                                                                },
                                                            ],
                                                        }}
                                                        options={{
                                                            indexAxis: "y",
                                                            scales: {
                                                                x: {
                                                                    title: {
                                                                        display:
                                                                            true,
                                                                        text: t(
                                                                            "Prevalence %"
                                                                        ),
                                                                    },
                                                                    beginAtZero:
                                                                        true,
                                                                    max: xAxisMax,
                                                                },
                                                                y: {
                                                                    title: {
                                                                        display:
                                                                            true,
                                                                        text: t(
                                                                            "Year"
                                                                        ),
                                                                    },
                                                                    reverse:
                                                                        false,
                                                                    ticks: {
                                                                        callback:
                                                                            function (
                                                                                _,
                                                                                index
                                                                            ) {
                                                                                return yearOptions[
                                                                                    index
                                                                                ];
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
                                                                    backgroundColor:
                                                                        "rgba(0, 0, 0, 1)",
                                                                    titleFont: {
                                                                        size: 14,
                                                                    },
                                                                    bodyFont: {
                                                                        size: 12,
                                                                    },
                                                                    displayColors:
                                                                        true,
                                                                    borderColor:
                                                                        "#fff",
                                                                    borderWidth: 1,
                                                                    caretPadding: 120,
                                                                    yAlign: "center",
                                                                    callbacks: {
                                                                        label: (
                                                                            context
                                                                        ) => {
                                                                            const year =
                                                                                parseInt(
                                                                                    context.label,
                                                                                    10
                                                                                );
                                                                            const data =
                                                                                chartData[
                                                                                    key
                                                                                ]?.[
                                                                                    year
                                                                                ] ||
                                                                                {};
                                                                            const rawData =
                                                                                context.raw as ChartDataPoint;
                                                                            return [
                                                                                `${t(
                                                                                    "Prevalence"
                                                                                )}: ${
                                                                                    rawData.x
                                                                                }%`,
                                                                                `${t(
                                                                                    "CI_min"
                                                                                )}: ${
                                                                                    data.ciMin
                                                                                }`,
                                                                                `${t(
                                                                                    "CI_max"
                                                                                )}: ${
                                                                                    data.ciMax
                                                                                }`,
                                                                                `${t(
                                                                                    "Samples"
                                                                                )}: ${
                                                                                    data.numberOfSamples
                                                                                }`,
                                                                                `${t(
                                                                                    "Positive"
                                                                                )}: ${
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
                                                                afterDraw: (
                                                                    chart: ChartJS
                                                                ) =>
                                                                    drawErrorBars(
                                                                        chart
                                                                    ),
                                                            },
                                                            logoPlugin,
                                                        ]}
                                                        ref={
                                                            chartRefs.current[
                                                                refKey
                                                            ]
                                                        }
                                                    />

                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            size="medium"
                                                            onClick={() =>
                                                                downloadChart(
                                                                    chartRefs
                                                                        .current[
                                                                        refKey
                                                                    ],
                                                                    refKey
                                                                )
                                                            }
                                                            sx={{
                                                                textTransform:
                                                                    "none",
                                                            }}
                                                        >
                                                            {t(
                                                                "Download_Chart"
                                                            )}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            {/* Pagination wrapped in a sticky Box */}
                            <Box
                                sx={{
                                    position: "sticky",
                                    bottom: "80px", // Height of the download button (60px) + padding
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
