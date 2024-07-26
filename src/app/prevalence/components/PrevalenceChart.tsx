import React from "react";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
// eslint-disable-next-line import/named
import { Box, CircularProgress, Typography, Grid } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// Define getRandomColor before its usage
const getRandomColor = (): string => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const PrevalenceChart: React.FC = () => {
    const {
        selectedMicroorganisms,

        prevalenceData,
        loading,
    } = usePrevalenceFilters();

    const yearOptions = Array.from({ length: 14 }, (_, i) => 2009 + i);

    const generateChartData = (): {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: { [key: string]: { [key: number]: any } };
    } => {
        const chartData: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [key: string]: { [key: string]: { [key: number]: any } };
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
                percentage: entry.percentageOfPositive,
                ciMin: entry.ciMin,
                ciMax: entry.ciMax,
                numberOfSamples: entry.numberOfSamples,
                numberOfPositive: entry.numberOfPositive,
            };
        });

        return chartData;
    };

    const chartData = generateChartData();

    return (
        <Box sx={{ padding: 2 }}>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    {Object.keys(chartData).length === 0 ? (
                        <Typography variant="h6">
                            No data available for selected options.
                        </Typography>
                    ) : (
                        <Grid container spacing={4}>
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
                                            (microorganism) => (
                                                <Box
                                                    key={microorganism}
                                                    sx={{ marginBottom: 4 }}
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
                                                                        ) =>
                                                                            chartData[
                                                                                key
                                                                            ][
                                                                                microorganism
                                                                            ]?.[
                                                                                year
                                                                            ]
                                                                                ?.percentage ||
                                                                            0
                                                                    ),
                                                                    backgroundColor:
                                                                        getRandomColor(),
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
                                                                },
                                                                y: {
                                                                    title: {
                                                                        display:
                                                                            true,
                                                                        text: "Year",
                                                                    },
                                                                },
                                                            },
                                                            plugins: {
                                                                tooltip: {
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
                                                                                ][
                                                                                    microorganism
                                                                                ][
                                                                                    year
                                                                                ] ||
                                                                                {};
                                                                            return [
                                                                                `Prevalence: ${context.raw}%`,
                                                                                `CI Min: ${data.ciMin}`,
                                                                                `CI Max: ${data.ciMax}`,
                                                                                `Samples: ${data.numberOfSamples}`,
                                                                                `Positive: ${data.numberOfPositive}`,
                                                                            ];
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            )
                                        )}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}
        </Box>
    );
};

export { PrevalenceChart };
