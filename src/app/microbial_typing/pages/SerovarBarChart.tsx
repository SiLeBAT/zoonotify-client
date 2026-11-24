import React from "react";
import { useTranslation } from "react-i18next";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { OTHER_SEROVARS, type SerovarChart as Chart } from "./serovarChart";

/**
 * ColorBrewer "Spectral", as in the data steward's reference plot (#1935):
 * the most frequent serovar purple, through to dark red for other serovars.
 */
const SEROVAR_COLORS = [
    "#5e4fa2",
    "#3288bd",
    "#66c2a5",
    "#abdda4",
    "#e6f598",
    "#ffffbf",
    "#fee08b",
    "#fdae61",
    "#f46d43",
    "#d53e4f",
];
const OTHER_COLOR = "#9e0142";

const BAR_HEIGHT = 44;

/** Space between the bars and the legend, in px (#1951). */
const LEGEND_GAP = 24;

/** Recharts reads a dataKey as a path, so a serovar's "." would break it. */
function segmentKey(index: number): string {
    return `s${index}`;
}

/**
 * The x-axis title. Its translation marks the genus as `<i>…</i>`, which a
 * plain Recharts label would print literally, so draw the italics as tspans.
 */
function AxisLabel({
    text,
    viewBox,
}: {
    text: string;
    /** Set by Recharts: the axis's box. */
    viewBox?: { x: number; y: number; width: number; height: number };
}): JSX.Element | null {
    if (!viewBox) return null;
    // split on <i>…</i>: odd-indexed parts are the italic ones
    const parts = text.split(/<i>(.*?)<\/i>/);
    return (
        <text
            x={viewBox.x + viewBox.width / 2}
            y={viewBox.y + viewBox.height + 10}
            textAnchor="middle"
            dominantBaseline="hanging"
            fill="#666"
        >
            {parts.map((part, index) =>
                index % 2 === 1 ? (
                    <tspan key={index} fontStyle="italic">
                        {part}
                    </tspan>
                ) : (
                    part
                )
            )}
        </text>
    );
}

export function SerovarBarChart({ chart }: { chart: Chart }): JSX.Element {
    const { t } = useTranslation(["MicrobialTyping"]);

    const data = chart.bars.map((bar) => {
        const point: Record<string, string | number> = {
            label: `${bar.sampleOrigin}, ${bar.matrix}, ${bar.samplingStage}, N = ${bar.n}`,
        };
        chart.serovars.forEach((serovar, index) => {
            point[segmentKey(index)] = bar.shares[serovar] ?? 0;
        });
        return point;
    });

    return (
        <ResponsiveContainer
            width="100%"
            height={chart.bars.length * BAR_HEIGHT + 160}
        >
            <BarChart
                layout="vertical"
                data={data}
                barCategoryGap="25%"
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                    type="number"
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    label={<AxisLabel text={t("SerovarShareAxis")} />}
                />
                <YAxis
                    dataKey="label"
                    type="category"
                    width={380}
                    tick={{ fontSize: 13 }}
                />
                <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)} %`}
                />
                <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    // Recharts measures the legend with its padding and
                    // narrows the plot to fit, so this is the gap to the bars.
                    wrapperStyle={{ paddingLeft: LEGEND_GAP }}
                />
                {chart.serovars.map((serovar, index) => {
                    const other = serovar === OTHER_SEROVARS;
                    return (
                        <Bar
                            key={serovar}
                            dataKey={segmentKey(index)}
                            name={other ? t("OtherSerovars") : serovar}
                            stackId="serovars"
                            fill={other ? OTHER_COLOR : SEROVAR_COLORS[index]}
                            isAnimationActive={false}
                        />
                    );
                })}
            </BarChart>
        </ResponsiveContainer>
    );
}
