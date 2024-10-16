import React, { useRef, useState } from "react";
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
import { Chart, registerables } from "chart.js";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";

Chart.register(...registerables);

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

const formatMicroorganismName = (
    microName: string | null | undefined
): JSX.Element => {
    if (!microName) {
        console.warn("Received null or undefined microorganism name");
        return <></>;
    }

    const words = microName
        .split(/([-\s])/)
        .filter((part: string) => part.length > 0);

    return (
        <>
            {words.map((word: string, index: number) => {
                if (word.trim() === "" || word === "-") {
                    return word;
                }

                const italic = italicWords.some((italicWord: string) =>
                    word.toLowerCase().includes(italicWord.toLowerCase())
                );

                return italic ? (
                    <i key={index}>{word}</i>
                ) : (
                    <span key={index}>{word}</span>
                );
            })}
        </>
    );
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

const PrevalenceChart: React.FC = () => {
    const { prevalenceData, loading } = usePrevalenceFilters();
    const chartRefs = useRef<{
        [key: string]: React.RefObject<Chart<"bar", ChartDataPoint[], unknown>>;
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
    // Also reset the currently selected microorganism to one of the available options
    React.useEffect(() => {
        if (prevalenceData.length > 0) {
            updateAvailableMicroorganisms();
        }
    }, [prevalenceData]);

    React.useEffect(() => {
        if (
            currentMicroorganism &&
            !availableMicroorganisms.includes(currentMicroorganism)
        ) {
            setCurrentMicroorganism(availableMicroorganisms[0]);
        }
        setCurrentMicroorganism(availableMicroorganisms[0]);
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

    const displayedCharts = chartKeys.slice(
        (currentPage - 1) * chartsPerPage,
        currentPage * chartsPerPage
    );

    const isBelow25Percent = Object.values(chartData)
        .flatMap((yearData) =>
            Object.values(yearData).every((data) => data.ciMax <= 25)
        )
        .every(Boolean);
    const xAxisMax = isBelow25Percent ? 25 : 100;

    const drawErrorBars = (chart: Chart): void => {
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
                    const y = bar.y;

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
        afterEvent: (chart: Chart, args: { event: any }) => {
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
                        const y = bar.y;

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

    const downloadChart = (
        chartRef: React.RefObject<Chart<"bar", ChartDataPoint[], unknown>>,
        chartKey: string
    ): void => {
        if (chartRef.current) {
            const chartInstance = chartRef.current;
            const timestamp = getCurrentTimestamp();
            const canvas = chartInstance.canvas;
            const ctx = canvas.getContext("2d");

            if (ctx) {
                const tempCanvas = document.createElement("canvas");
                const tempCtx = tempCanvas.getContext("2d");

                const extraHeight = 40;
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height + extraHeight;

                if (tempCtx) {
                    tempCtx.fillStyle = "white";
                    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                    tempCtx.drawImage(canvas, 0, extraHeight);

                    // Ensure currentMicroorganism is not null before splitting
                    if (currentMicroorganism) {
                        const words = currentMicroorganism
                            .split(/([-\s])/)
                            .filter((part: string) => part.length > 0);

                        let totalWidth = 0;
                        words.forEach((word) => {
                            const italic = italicWords.some((italicWord) =>
                                word
                                    .toLowerCase()
                                    .includes(italicWord.toLowerCase())
                            );
                            tempCtx.font = italic
                                ? "italic 20px Arial"
                                : "20px Arial";
                            totalWidth += tempCtx.measureText(word).width + 2;
                        });

                        let xPos = (tempCanvas.width - totalWidth) / 2;
                        const yPos = 30;

                        words.forEach((word) => {
                            const italic = italicWords.some((italicWord) =>
                                word
                                    .toLowerCase()
                                    .includes(italicWord.toLowerCase())
                            );

                            tempCtx.font = italic
                                ? "italic 20px Arial"
                                : "20px Arial";
                            tempCtx.fillStyle = "black";
                            tempCtx.fillText(word, xPos, yPos);
                            xPos += tempCtx.measureText(word).width + 2;
                        });
                    }

                    const link = document.createElement("a");
                    link.href = tempCanvas.toDataURL();
                    link.download = `${chartKey}-${timestamp}.png`;
                    link.click();
                }
            }
        }
    };

    const downloadAllCharts = async (): Promise<void> => {
        const zip = new JSZip();
        const timestamp = getCurrentTimestamp();
        const chartPromises = Object.keys(chartRefs.current).map(
            async (key) => {
                const chartRef = chartRefs.current[key];
                if (chartRef && chartRef.current) {
                    const chartInstance = chartRef.current;
                    const canvas = chartInstance.canvas;
                    const ctx = canvas.getContext("2d");

                    if (ctx) {
                        const tempCanvas = document.createElement("canvas");
                        const tempCtx = tempCanvas.getContext("2d");

                        const extraHeight = 40;
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
                            tempCtx.drawImage(canvas, 0, extraHeight);

                            // Ensure currentMicroorganism is not null before splitting
                            if (currentMicroorganism) {
                                const words = currentMicroorganism
                                    .split(/([-\s])/)
                                    .filter((part: string) => part.length > 0);

                                let totalWidth = 0;
                                words.forEach((word) => {
                                    const italic = italicWords.some(
                                        (italicWord) =>
                                            word
                                                .toLowerCase()
                                                .includes(
                                                    italicWord.toLowerCase()
                                                )
                                    );
                                    tempCtx.font = italic
                                        ? "italic 20px Arial"
                                        : "20px Arial";
                                    totalWidth +=
                                        tempCtx.measureText(word).width + 2;
                                });

                                let xPos = (tempCanvas.width - totalWidth) / 2;
                                const yPos = 30;

                                words.forEach((word) => {
                                    const italic = italicWords.some(
                                        (italicWord) =>
                                            word
                                                .toLowerCase()
                                                .includes(
                                                    italicWord.toLowerCase()
                                                )
                                    );

                                    tempCtx.font = italic
                                        ? "italic 20px Arial"
                                        : "20px Arial";
                                    tempCtx.fillStyle = "black";
                                    tempCtx.fillText(word, xPos, yPos);
                                    xPos += tempCtx.measureText(word).width + 2;
                                });
                            }

                            const base64Image = tempCanvas
                                .toDataURL()
                                .split(",")[1];
                            zip.file(`${key}-${timestamp}.png`, base64Image, {
                                base64: true,
                            });
                        }
                    }
                }
            }
        );

        await Promise.all(chartPromises);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `charts-${timestamp}.zip`);
    };

    const logoPlugin = {
        id: "logoPlugin",
        beforeDraw: (chart: Chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        },
        afterDraw: (chart: Chart) => {
            const ctx = chart.ctx;
            const img = new Image();
            img.src = "/assets/bfr_logo.png";
            img.onload = () => {
                const extraPadding = 20;
                const logoWidth = 60;
                const logoHeight = 27;

                const logoX = chart.chartArea.left + 20;
                const logoY = chart.chartArea.bottom + extraPadding;

                ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight);

                const dateText = `${t("Generated_on")}: ${getFormattedDate()}`;
                ctx.font = "10px Arial";
                ctx.fillStyle = "#000";
                ctx.textAlign = "right";
                ctx.fillText(dateText, chart.width - 10, chart.height - 5);
            };
        },
    };

    return (
        <Box sx={{ padding: 0, position: "relative", minHeight: "100vh" }}>
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
                        Select Microorganism
                    </InputLabel>
                    <Select
                        labelId="microorganism-select-label"
                        value={currentMicroorganism || ""}
                        onChange={(event) =>
                            setCurrentMicroorganism(
                                event.target.value as string
                            )
                        }
                        label="Select Microorganism"
                        sx={{ backgroundColor: "#f5f5f5" }}
                        renderValue={(selected) => (
                            <Typography component="span">
                                {formatMicroorganismName(selected)}
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
                                        {formatMicroorganismName(microorganism)}
                                    </Typography>
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>
                                <Typography component="span">
                                    No Microorganisms Available
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
                                {displayedCharts.map((key) => {
                                    const refKey = `${key}-${currentMicroorganism}`;
                                    if (!chartRefs.current[refKey]) {
                                        chartRefs.current[refKey] =
                                            React.createRef<
                                                Chart<
                                                    "bar",
                                                    ChartDataPoint[],
                                                    unknown
                                                >
                                            >();
                                    }

                                    return (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={12}
                                            md={6}
                                            lg={6}
                                            key={refKey}
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
                                                    {formatMicroorganismName(
                                                        currentMicroorganism
                                                    )}
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
                                                                    chart: Chart
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

                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={(_, value) => setCurrentPage(value)}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    mt: 4,
                                }}
                            />

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
