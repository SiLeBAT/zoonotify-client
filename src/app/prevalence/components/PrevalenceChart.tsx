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
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";

Chart.register(...registerables);

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
    const { selectedMicroorganisms, prevalenceData, loading } =
        usePrevalenceFilters();
    const chartRefs = useRef<{
        [key: string]: React.RefObject<Chart<"bar", ChartDataPoint[], unknown>>;
    }>({});
    const { t } = useTranslation(["PrevalencePage"]);
    const [currentMicroorganism, setCurrentMicroorganism] = useState(
        selectedMicroorganisms[0] || ""
    );

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

    const downloadChart = (
        chartRef: React.RefObject<Chart<"bar", ChartDataPoint[], unknown>>,
        chartKey: string
    ): void => {
        if (chartRef.current) {
            const timestamp = getCurrentTimestamp();
            const link = document.createElement("a");
            link.href = chartRef.current.toBase64Image();
            link.download = `${chartKey}-${timestamp}.png`;
            link.click();
        } else {
            console.error(
                "Chart reference is invalid or toBase64Image method not found"
            );
        }
    };

    const downloadAllCharts = async (): Promise<void> => {
        const zip = new JSZip();
        const timestamp = getCurrentTimestamp();
        const chartPromises = Object.keys(chartRefs.current).map(
            async (key) => {
                const chartRef = chartRefs.current[key];
                if (chartRef && chartRef.current) {
                    const base64Image = chartRef.current
                        .toBase64Image()
                        .split(",")[1];
                    zip.file(`${key}-${timestamp}.png`, base64Image, {
                        base64: true,
                    });
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
            // Set the background to white before drawing the chart
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
                const rightPadding = 0;
                const topPadding = 0;
                const logoWidth = 90;
                const logoHeight = 40;
                ctx.drawImage(
                    img,
                    chart.width - logoWidth - rightPadding,
                    topPadding,
                    logoWidth,
                    logoHeight
                );

                const dateText = `${t("Generated_on")}: ${getFormattedDate()}`;
                ctx.font = "12px Arial";
                ctx.fillStyle = "#000";
                ctx.textAlign = "right";
                ctx.fillText(dateText, chart.width - 10, chart.height - 10);
            };
        },
    };

    return (
        <Box sx={{ padding: 1, position: "relative", minHeight: "100vh" }}>
            <FormControl
                fullWidth
                sx={{
                    mb: 1,
                    backgroundColor: "white",
                }}
            >
                <InputLabel id="microorganism-select-label">
                    Select Microorganism
                </InputLabel>
                <Select
                    labelId="microorganism-select-label"
                    value={currentMicroorganism}
                    onChange={(event) =>
                        setCurrentMicroorganism(event.target.value as string)
                    }
                    label="Select Microorganism"
                    sx={{
                        backgroundColor: "#f5f5f5",
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "white",
                            },
                            "&:hover fieldset": {
                                borderColor: "white",
                            },
                        },
                    }}
                >
                    {selectedMicroorganisms.map((microorganism) => (
                        <MenuItem key={microorganism} value={microorganism}>
                            {microorganism}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
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
                                {Object.keys(chartData).map((key) => {
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
                                            md={6}
                                            lg={4}
                                            key={key}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: "white",
                                                    padding: 2,
                                                    borderRadius: 1,
                                                    boxShadow: 1,
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    align="center"
                                                    gutterBottom
                                                    sx={{
                                                        minHeight: "65px",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace: "normal",
                                                        wordWrap: "break-word",
                                                    }}
                                                >
                                                    {key}
                                                </Typography>
                                                <Box sx={{ marginBottom: 4 }}>
                                                    <Bar
                                                        data={{
                                                            labels: yearOptions,
                                                            datasets: [
                                                                {
                                                                    label: currentMicroorganism,
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
                                                                        text: "Prevalence (%)",
                                                                    },
                                                                    beginAtZero:
                                                                        true,
                                                                    max: xAxisMax,
                                                                },
                                                                y: {
                                                                    title: {
                                                                        display:
                                                                            true,
                                                                        text: "Year",
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
                                                                tooltip: {
                                                                    backgroundColor:
                                                                        "rgba(0, 0, 0, 1)", // Opaque tooltip background
                                                                    titleFont: {
                                                                        size: 14,
                                                                    },
                                                                    bodyFont: {
                                                                        size: 12,
                                                                    },
                                                                    displayColors:
                                                                        false,
                                                                    borderColor:
                                                                        "#fff",
                                                                    borderWidth: 1,
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
                                                                                `Prevalence: ${rawData.x}%`,
                                                                                `CI Min: ${data.ciMin}`,
                                                                                `CI Max: ${data.ciMax}`,
                                                                                `Samples: ${data.numberOfSamples}`,
                                                                                `Positive: ${data.numberOfPositive}`,
                                                                            ];
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            animation: false,
                                                        }}
                                                        plugins={[
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
                                                    <Button
                                                        variant="contained"
                                                        onClick={() =>
                                                            downloadChart(
                                                                chartRefs
                                                                    .current[
                                                                    refKey
                                                                ],
                                                                refKey
                                                            )
                                                        }
                                                    >
                                                        {t("Download_Chart")}
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                            <Box
                                sx={{
                                    position: "sticky",
                                    bottom: 0,
                                    color: "inherit",
                                    padding: 0,
                                    textAlign: "center",
                                    zIndex: 1000,
                                    boxShadow: "0 0px 0px rgba(0,0,0,0)",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    onClick={downloadAllCharts}
                                    sx={{ width: "100%", height: "50px" }}
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
