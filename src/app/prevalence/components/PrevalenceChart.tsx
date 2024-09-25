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

const italicWords: string[] = [
    "Salmonella", "coli", "E.", "Bacillus", "cereus", "monocytogenes", 
    "Clostridioides", "difficile", "Yersinia", "Listeria", "enterocolitica", 
    "Vibrio", "Baylisascaris", "procyonis", "Echinococcus", "Campylobacter",
];

const formatMicroorganismName = (microName: string | null | undefined): JSX.Element => {
    if (!microName) {
        console.warn("Received null or undefined microorganism name");
        return <></>;
    }

    // Split by space and dash while preserving the separators
    const words = microName.split(/([-\s])/).filter((part: string) => part.length > 0);

    return (
        <>
            {words.map((word: string, index: number) => {
                // If the word is just a separator (space or dash), return it as is
                if (word.trim() === '' || word === '-') {
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
    const { selectedMicroorganisms, prevalenceData, loading } = usePrevalenceFilters();
    const chartRefs = useRef<{ [key: string]: React.RefObject<Chart<"bar", ChartDataPoint[], unknown>> }>({});
    const { t } = useTranslation(["PrevalencePage"]);
    const [currentMicroorganism, setCurrentMicroorganism] = useState(selectedMicroorganisms[0] || "");

    const yearOptions = Array.from({ length: 14 }, (_, i) => 2009 + i).reverse();

    const generateChartData = (): { [key: string]: { [key: number]: ChartDataPoint } } => {
        const chartData: { [key: string]: { [key: number]: ChartDataPoint } } = {};
        prevalenceData.forEach((entry) => {
            if (entry.microorganism === currentMicroorganism) {
                const key = `${entry.sampleOrigin}-${entry.matrix}-${entry.samplingStage}`; // Move to legend
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
                    const xMin = chart.scales.x.getPixelForValue(dataPoint.ciMin);
                    const xMax = chart.scales.x.getPixelForValue(dataPoint.ciMax);
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
            console.error("Chart reference is invalid or toBase64Image method not found");
        }
    };

    const downloadAllCharts = async (): Promise<void> => {
        const zip = new JSZip();
        const timestamp = getCurrentTimestamp();
        const chartPromises = Object.keys(chartRefs.current).map(async (key) => {
            const chartRef = chartRefs.current[key];
            if (chartRef && chartRef.current) {
                const base64Image = chartRef.current.toBase64Image().split(",")[1];
                zip.file(`${key}-${timestamp}.png`, base64Image, { base64: true });
            }
        });

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
                const rightPadding = 0;
                const topPadding = 0;
                const logoWidth = 50;
                const logoHeight = 20;
                ctx.drawImage(img, chart.width - logoWidth - rightPadding, topPadding, logoWidth, logoHeight);

                const dateText = `${t("Generated_on")}: ${getFormattedDate()}`;
                ctx.font = "10px Arial";
                ctx.fillStyle = "#000";
                ctx.textAlign = "right";
                ctx.fillText(dateText, chart.width - 10, chart.height - 10);
            };
        },
    };

    return (
        <Box sx={{ padding: 0, position: "relative", minHeight: "100vh" }}>
        {/* Sticky microorganism dropdown */}
        <Box 
            sx={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 1000, 
                padding: 0.8, 
                backgroundColor: 'rgb(219, 228, 235)',  
                
            }}
        >
            <FormControl fullWidth sx={{ mb: 1 }} variant="outlined">
    <InputLabel id="microorganism-select-label" shrink={true}> 
        Select Microorganism
    </InputLabel>
    <Select
        labelId="microorganism-select-label"
        value={currentMicroorganism}
        onChange={(event) => setCurrentMicroorganism(event.target.value as string)}
        label="Select Microorganism"
        sx={{ backgroundColor: "#f5f5f5" }}
        renderValue={(selected) => (
            <Typography component="span">
                {formatMicroorganismName(selected)}
            </Typography>
        )}
    >
        {selectedMicroorganisms.map((microorganism) => (
            <MenuItem key={microorganism} value={microorganism}>
                <Typography component="span">
                    {formatMicroorganismName(microorganism)}
                </Typography>
            </MenuItem>
        ))}
    </Select>
</FormControl>
        </Box>
   
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    {Object.keys(chartData).length === 0 ? (
                        <Typography variant="h6">{t("No_data_available")}</Typography>
                    ) : (
                        <>
                            <Grid container spacing={4}>
                                {Object.keys(chartData).map((key) => {
                                    const refKey = `${key}-${currentMicroorganism}`;
                                    if (!chartRefs.current[refKey]) {
                                        chartRefs.current[refKey] = React.createRef<Chart<"bar", ChartDataPoint[], unknown>>();
                                    }

                                    return (
                                        <Grid item xs={12} sm={12} md={6} lg={6}>
                                            <Box sx={{ backgroundColor: "white", padding: 2, borderRadius: 1, boxShadow: 1 }}>
                                                {/* Title updated with Microorganism */}
                                                <Typography
                                                    variant="h6"
                                                    align="center"
                                                    gutterBottom
                                                    sx={{ minHeight: "50px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "normal", wordWrap: "break-word" }}
                                                >
                                                    {formatMicroorganismName(currentMicroorganism)}
                                                </Typography>
                                                <Box sx={{ marginBottom: 4 }}>
                                                    <Bar
                                                        data={{
                                                            labels: yearOptions,
                                                            datasets: [
                                                                {
                                                                    // Legend updated with Sample Origin, Matrix, Sampling Stage
                                                                    label: key, 
                                                                    data: yearOptions.map(
                                                                        (year) => chartData[key]?.[year] || { x: 0, y: year, ciMin: 0, ciMax: 0 }
                                                                    ) as ChartDataPoint[],
                                                                    backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                                                                },
                                                            ],
                                                        }}
                                                        options={{
                                                            indexAxis: "y",
                                                            scales: {
                                                                x: {
                                                                    title: { display: true, text: t("Prevalence %") },
                                                                    beginAtZero: true,
                                                                    max: xAxisMax,
                                                                },
                                                                y: {
                                                                    title: { display: true, text: t("Year") },
                                                                    reverse: false,
                                                                    ticks: {
                                                                        callback: function (_, index) {
                                                                            return yearOptions[index];
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            plugins: {
                                                                tooltip: {
                                                                    backgroundColor: "rgba(0, 0, 0, 1)",
                                                                    titleFont: { size: 14 },
                                                                    bodyFont: { size: 12 },
                                                                    displayColors: false,
                                                                    borderColor: "#fff",
                                                                    borderWidth: 1,
                                                                    callbacks: {
                                                                        label: (context) => {
                                                                            const year = parseInt(context.label, 10);
                                                                            const data = chartData[key]?.[year] || {};
                                                                            const rawData = context.raw as ChartDataPoint;
                                                                            return [
                                                                                `${t("Prevalence")}: ${rawData.x}%`,
                                                                                `${t("CI_min")}: ${data.ciMin}`,
                                                                                `${t("CI_max")}: ${data.ciMax}`,
                                                                                `${t("Samples")}: ${data.numberOfSamples}`,
                                                                                `${t("Positive")}: ${data.numberOfPositive}`,
                                                                            ];
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            animation: false,
                                                        }}
                                                        plugins={[
                                                            { id: "customErrorBars", afterDraw: (chart: Chart) => drawErrorBars(chart) },
                                                            logoPlugin,
                                                        ]}
                                                        ref={chartRefs.current[refKey]}
                                                    />
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => downloadChart(chartRefs.current[refKey], refKey)}
                                                            sx={{ textTransform: 'none' }}
                                                        >
                                                            {t("Download_Chart")}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            <Box sx={{ position: "sticky", bottom: 0, color: "inherit", textAlign: "center", zIndex: 1000,padding: 1, 
                backgroundColor: 'rgb(219, 228, 235)',    }}>
                                <Button variant="contained" onClick={downloadAllCharts} sx={{ width: "100%", height: "50px" }}>
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
