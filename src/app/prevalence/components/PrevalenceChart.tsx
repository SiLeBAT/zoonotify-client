import React, { useRef } from "react";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import { Box, CircularProgress, Typography, Grid, Button } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";

Chart.register(...registerables);

const getRandomColor = (): string => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const getCurrentTimestamp = (): string => {
    const now = new Date();
    return now.toISOString().replace(/[-:.]/g, "");
};

const getFormattedDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString();
};

interface ChartDataPoint {
    x: number;
    y: number;
    ciMin: number;
    ciMax: number;
    numberOfSamples?: number;
    numberOfPositive?: number;
}

const PrevalenceChart: React.FC = () => {
    const { selectedMicroorganisms, prevalenceData, loading } =
        usePrevalenceFilters();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartRefs = useRef<{ [key: string]: React.RefObject<any> }>({});

    const { t } = useTranslation(["PrevalencePage"]);

    const yearOptions = Array.from(
        { length: 14 },
        (_, i) => 2009 + i
    ).reverse();

    const generateChartData = (): {
        [key: string]: { [key: string]: { [key: number]: ChartDataPoint } };
    } => {
        const chartData: {
            [key: string]: { [key: string]: { [key: number]: ChartDataPoint } };
        } = {};

        prevalenceData.forEach((entry) => {
            const key = `${entry.sampleOrigin}-${entry.matrix}-${entry.samplingStage}`;

            if (!chartData[key]) {
                chartData[key] = {};
            }

            if (!chartData[key][entry.microorganism]) {
                chartData[key][entry.microorganism] = {};
            }

            chartData[key][entry.microorganism][entry.samplingYear] = {
                x: entry.percentageOfPositive,
                y: entry.samplingYear,
                ciMin: entry.ciMin,
                ciMax: entry.ciMax,
                numberOfSamples: entry.numberOfSamples,
                numberOfPositive: entry.numberOfPositive,
            };
        });

        return chartData;
    };

    const chartData = generateChartData();

    const maxCIValue = Math.max(
        ...Object.values(chartData).flatMap((microData) =>
            Object.values(microData).flatMap((yearData) =>
                Object.values(yearData).map((data) => data.ciMax)
            )
        )
    );

    const drawErrorBars = (chart: Chart): void => {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            meta.data.forEach((bar: any, index: number) => {
                const dataPoint = dataset.data[index] as ChartDataPoint;
                if (
                    dataPoint &&
                    (dataPoint.ciMin !== 0 ||
                        dataPoint.ciMax !== 0 ||
                        dataPoint.x !== 0)
                ) {
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

                    // Draw caps on the error bars
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chartRef: React.RefObject<any>,
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

    // Custom plugin to draw the logo and date
    const logoPlugin = {
        id: "logoPlugin",
        afterDraw: (chart: Chart) => {
            const ctx = chart.ctx;
            const img = new Image();
            img.src = "/assets/bfr_logo.png"; // Ensure this path is correct
            img.onload = () => {
                const rightPadding = 0; // Add padding from the right edge
                const topPadding = 0; // Add padding from the top edge
                const logoWidth = 90; // Set the logo width
                const logoHeight = 40;
                ctx.drawImage(
                    img,
                    chart.width - logoWidth - rightPadding, // Adjusted horizontal position
                    topPadding, // Adjusted vertical position to be closer to the top
                    logoWidth,
                    logoHeight
                );

                // Add the date to the bottom of the chart using translation
                const dateText = `${t("Generated_on")}: ${getFormattedDate()}`;
                ctx.font = "12px Arial";
                ctx.fillStyle = "#000";
                ctx.textAlign = "right";
                ctx.fillText(dateText, chart.width - 10, chart.height - 10);
            };
        },
    };

    return (
        <Box sx={{ padding: 2, position: "relative", minHeight: "100vh" }}>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    {Object.keys(chartData).length === 0 ? (
                        <Typography variant="h6">
                            No data available for selected options.
                        </Typography>
                    ) : (
                        <>
                            <Grid
                                container
                                spacing={4}
                                sx={{ marginBottom: "60px" }}
                            >
                                {Object.keys(chartData).map((key) => (
                                    <Grid item xs={12} md={6} lg={4} key={key}>
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
                                            >
                                                {key}
                                            </Typography>
                                            {selectedMicroorganisms.map(
                                                (microorganism) => {
                                                    const chartKey = `${key}-${microorganism}`;
                                                    if (
                                                        !chartRefs.current[
                                                            chartKey
                                                        ]
                                                    ) {
                                                        chartRefs.current[
                                                            chartKey
                                                        ] = React.createRef();
                                                    }
                                                    return (
                                                        <Box
                                                            key={microorganism}
                                                            sx={{
                                                                marginBottom: 4,
                                                            }}
                                                        >
                                                            <Bar
                                                                data={{
                                                                    labels: yearOptions,
                                                                    datasets: [
                                                                        {
                                                                            label: microorganism,
                                                                            data: yearOptions.map(
                                                                                (
                                                                                    year
                                                                                ) => {
                                                                                    const data =
                                                                                        chartData[
                                                                                            key
                                                                                        ][
                                                                                            microorganism
                                                                                        ]?.[
                                                                                            year
                                                                                        ] || {
                                                                                            x: 0,
                                                                                            y: year,
                                                                                            ciMin: 0,
                                                                                            ciMax: 0,
                                                                                        };
                                                                                    return data;
                                                                                }
                                                                            ),
                                                                            backgroundColor:
                                                                                getRandomColor(),
                                                                        },
                                                                    ],
                                                                }}
                                                                options={{
                                                                    indexAxis:
                                                                        "y",
                                                                    scales: {
                                                                        x: {
                                                                            title: {
                                                                                display:
                                                                                    true,
                                                                                text: "Prevalence (%)",
                                                                            },
                                                                            beginAtZero:
                                                                                true,
                                                                            max: maxCIValue,
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
                                                                        tooltip:
                                                                            {
                                                                                callbacks:
                                                                                    {
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
                                                                                                ][
                                                                                                    microorganism
                                                                                                ]?.[
                                                                                                    year
                                                                                                ] ||
                                                                                                {};
                                                                                            return [
                                                                                                `Prevalence: ${
                                                                                                    (
                                                                                                        context.raw as ChartDataPoint
                                                                                                    )
                                                                                                        .x
                                                                                                }%`,
                                                                                                `CI Min: ${
                                                                                                    (
                                                                                                        data as ChartDataPoint
                                                                                                    )
                                                                                                        .ciMin
                                                                                                }`,
                                                                                                `CI Max: ${
                                                                                                    (
                                                                                                        data as ChartDataPoint
                                                                                                    )
                                                                                                        .ciMax
                                                                                                }`,
                                                                                                `Samples: ${
                                                                                                    (
                                                                                                        data as ChartDataPoint
                                                                                                    )
                                                                                                        .numberOfSamples
                                                                                                }`,
                                                                                                `Positive: ${
                                                                                                    (
                                                                                                        data as ChartDataPoint
                                                                                                    )
                                                                                                        .numberOfPositive
                                                                                                }`,
                                                                                            ];
                                                                                        },
                                                                                    },
                                                                            },
                                                                    },
                                                                    animation:
                                                                        false, // Disable animation to see the error bars immediately
                                                                }}
                                                                plugins={[
                                                                    {
                                                                        id: "customErrorBars",
                                                                        afterDraw:
                                                                            (
                                                                                chart: Chart
                                                                            ) =>
                                                                                drawErrorBars(
                                                                                    chart
                                                                                ),
                                                                    },
                                                                    logoPlugin, // Include the custom logo plugin here
                                                                ]}
                                                                ref={
                                                                    chartRefs
                                                                        .current[
                                                                        chartKey
                                                                    ]
                                                                }
                                                            />
                                                            <Button
                                                                variant="contained"
                                                                onClick={() =>
                                                                    downloadChart(
                                                                        chartRefs
                                                                            .current[
                                                                            chartKey
                                                                        ],
                                                                        chartKey
                                                                    )
                                                                }
                                                            >
                                                                {t(
                                                                    "Download_Chart"
                                                                )}
                                                            </Button>
                                                        </Box>
                                                    );
                                                }
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
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
