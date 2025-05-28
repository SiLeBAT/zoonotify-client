import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    Label,
} from "recharts";
import { Typography } from "@mui/material";
//import { useTranslation } from "react-i18next"; // <-- ADD THIS LINE

// Extended props to include anzahlGetesteterIsolate (optional for safety)
export interface TrendChartProps {
    data: {
        samplingYear: number;
        resistenzrate: number;
        antimicrobialSubstance: string;
        anzahlGetesteterIsolate?: number;
    }[];
}

const COLORS = [
    "#F08080",
    "#B8860B",
    "#8FBC8F",
    "#4682B4",
    "#00CED1",
    "#4169E1",
    "#9932CC",
    "#C71585",
    "#2E8B57",
    "#B22222",
    "#F4A460",
    "#008B8B",
    "#BDB76B",
    "#FF6347",
    "#20B2AA",
    "#1E90FF",
    "#FFD700",
    "#DC143C",
    "#556B2F",
    "#40E0D0",
    "#7B68EE",
    "#D2691E",
    "#00FA9A",
    "#FF4500",
    "#3CB371",
    "#DA70D6",
    "#FFA07A",
    "#6A5ACD",
    "#CD5C5C",
    "#008080",
];

// Custom tick renderer for XAxis: show year and, underneath, tested isolates
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomXAxisTick = (chartData: any[]) => (props: any) => {
    const { x, y, payload } = props;
    const entry = chartData.find((e) => e.samplingYear === payload.value);
    return (
        <g>
            {/* Year label */}
            <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                fill="#888"
                fontSize={14}
            >
                {payload.value}
            </text>
            {/* Number of tested isolates */}
            {entry && entry.anzahlGetesteterIsolate !== undefined && (
                <text
                    x={x}
                    y={y + 28} // lower than year label
                    textAnchor="middle"
                    fill="#888"
                    fontSize={12}
                >
                    N = {entry.anzahlGetesteterIsolate}
                </text>
            )}
        </g>
    );
};

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    //const { t } = useTranslation(["Antibiotic"]);  // <-- ADD THIS LINE

    // Find all years and substances present in the data
    const years = Array.from(new Set(data.map((d) => d.samplingYear))).sort(
        (a, b) => a - b
    );
    const substances = Array.from(
        new Set(data.map((d) => d.antimicrobialSubstance))
    );

    // Prepare chartData: for each year, get value for each substance, and anzahlGetesteterIsolate for the year
    const chartData = years.map((year) => {
        // Each substance is a separate line
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entry: any = { samplingYear: year };
        substances.forEach((substance) => {
            const found = data.find(
                (d) =>
                    d.samplingYear === year &&
                    d.antimicrobialSubstance === substance
            );
            entry[substance] = found ? found.resistenzrate : null;
        });
        // Take the first anzahlGetesteterIsolate value for this year (assuming all same per year)
        const isolatesForYear = data.filter((d) => d.samplingYear === year);
        entry.anzahlGetesteterIsolate =
            isolatesForYear.length > 0
                ? isolatesForYear[0].anzahlGetesteterIsolate
                : null;
        return entry;
    });

    return (
        <div>
            <ResponsiveContainer width="100%" height={520}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="samplingYear"
                        height={52}
                        tick={renderCustomXAxisTick(chartData)}
                    >
                        <Label
                            value="Year"
                            offset={-5}
                            position="insideBottom"
                        />
                    </XAxis>
                    <YAxis
                        domain={[0, 100]}
                        tickFormatter={(v: number) => `${v}%`}
                    >
                        <Label
                            angle={-90}
                            position="insideLeft"
                            value="Resistenzrate (%)"
                            style={{ textAnchor: "middle" }}
                        />
                    </YAxis>
                    <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) =>
                            value !== null && value !== undefined
                                ? value.toFixed(1) + "%"
                                : "-"
                        }
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        wrapperStyle={{ margin: -20 }}
                        align="right"
                    />
                    {substances.map((substance, idx) => (
                        <Line
                            key={substance}
                            type="linear"
                            dataKey={substance}
                            name={substance}
                            stroke={COLORS[idx % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
            <Typography
                variant="caption"
                color="textSecondary"
                align="center"
                display="block"
                sx={{ mt: 1 }}
            >
                <span style={{ color: "#888" }}></span>
            </Typography>
        </div>
    );
};
