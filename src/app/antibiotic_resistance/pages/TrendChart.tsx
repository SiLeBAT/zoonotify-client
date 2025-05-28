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

// Each series: antimicrobialSubstance, each point: {samplingYear, resistenzrate}
export interface TrendChartProps {
    data: {
        samplingYear: number;
        resistenzrate: number;
        antimicrobialSubstance: string;
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

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    const years = Array.from(new Set(data.map((d) => d.samplingYear))).sort(
        (a, b) => a - b
    );
    const substances = Array.from(
        new Set(data.map((d) => d.antimicrobialSubstance))
    );

    const chartData = years.map((year) => {
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
        return entry;
    });

    return (
        <ResponsiveContainer width="100%" height={520}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="samplingYear">
                    <Label value="Year" offset={-5} position="insideBottom" />
                </XAxis>
                <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`}>
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
                        value !== null ? value.toFixed(1) + "%" : "-"
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
    );
};
