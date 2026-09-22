import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { Box, Button, Stack, Typography } from "@mui/material";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import React, { useRef, useState } from "react";
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
import { FormattedMicroorganismName } from "./AntibioticResistancePage.component";
import {
    type MultiResistanceBar,
    RESISTANCE_GROUP_COUNT,
    toMultiResistanceCsv,
} from "./multiResistanceHelpers";

/** Sampled from the data steward's example plot: susceptible green → >4× dark red. */
const RESISTANCE_GROUP_COLORS = [
    "#47D406",
    "#FBFCBB",
    "#FAE918",
    "#FA9018",
    "#FA1C18",
    "#89110F",
];

const RANKS = Array.from({ length: RESISTANCE_GROUP_COUNT }, (_, r) => r);

const BAR_HEIGHT = 44;

interface MultiResistanceChartProps {
    bars: MultiResistanceBar[];
    year: number;
    microorganism: string;
}

export const MultiResistanceChart: React.FC<MultiResistanceChartProps> = ({
    bars,
    year,
    microorganism,
}) => {
    const { t } = useTranslation(["Antibiotic"]);
    const chartRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const groupLabels = RANKS.map((r) => t(`MULTI_GROUP_${r}`));

    // one row per bar; stackOffset="expand" turns the counts into shares
    const chartData = bars.map((bar) => {
        const row: Record<string, string | number> = { label: bar.label };
        bar.groups.forEach((g) => {
            row[`g${g.rank}`] = g.count;
        });
        return row;
    });
    const barByLabel = new Map(bars.map((b) => [b.label, b]));

    const tooltipFormatter = (
        _value: number,
        name: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item: any
    ): [string, string] => {
        const bar = barByLabel.get(item?.payload?.label);
        const rank = groupLabels.indexOf(name);
        const group = bar?.groups[rank];
        if (!bar || !group) return ["-", name];
        return [
            t("MULTI_TOOLTIP", {
                isolates: group.count,
                n: bar.n,
                percent: (group.proportion * 100).toFixed(1),
            }),
            name,
        ];
    };

    const handleDownloadChart = async (): Promise<void> => {
        if (!chartRef.current) return;
        const canvas = await html2canvas(chartRef.current, {
            backgroundColor: "#fff",
            useCORS: true,
        });
        const link = document.createElement("a");
        link.download = `multi_resistance_chart_${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
    };

    const handleDownloadData = async (): Promise<void> => {
        const timestamp = new Date()
            .toISOString()
            .replace(/:/g, "-")
            .replace(/\..+/, "")
            .replace("T", "_");
        const headers = [
            t("combinations"),
            t("MULTI_RESISTANCE_GROUP"),
            t("MULTI_ISOLATES"),
            t("MULTI_TESTED_ISOLATES"),
            t("MULTI_PROPORTION"),
        ];
        const BOM = "\uFEFF";
        const zip = new JSZip();
        zip.file(
            `multi_resistance_comma_${timestamp}.csv`,
            BOM +
                toMultiResistanceCsv(bars, {
                    sep: ",",
                    decimalSep: ".",
                    headers,
                    groupLabels,
                })
        );
        zip.file(
            `multi_resistance_dot_${timestamp}.csv`,
            BOM +
                toMultiResistanceCsv(bars, {
                    sep: ";",
                    decimalSep: ",",
                    headers,
                    groupLabels,
                })
        );
        zip.file("README.txt", t("MULTI_README"));

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const safeMicro = microorganism.replace(/[^a-zA-Z0-9._-]+/g, "_");
        a.download = `multi_resistance_data_${safeMicro}_${timestamp}.zip`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handleShareLink = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    return (
        <Box>
            <div
                ref={chartRef}
                style={{
                    padding: "32px",
                    background: "#fff",
                    borderRadius: "16px",
                }}
            >
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                >
                    <Typography
                        variant="h6"
                        sx={{ color: "#003663", fontWeight: "bold" }}
                    >
                        {year},{" "}
                        <FormattedMicroorganismName
                            microName={microorganism}
                            fontWeight="bold"
                        />
                    </Typography>
                    <img
                        src="/assets/bfr_logo.png"
                        alt="BfR Logo"
                        style={{ width: 90, height: "auto", marginLeft: 12 }}
                    />
                </Box>

                <ResponsiveContainer
                    width="100%"
                    height={bars.length * BAR_HEIGHT + 140}
                >
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        stackOffset="expand"
                        barCategoryGap="25%"
                        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                        />
                        <XAxis
                            type="number"
                            domain={[0, 1]}
                            tickFormatter={(v: number) =>
                                `${Math.round(v * 100)}%`
                            }
                            label={{
                                value: t("MULTI_PROPORTION_AXIS"),
                                position: "bottom",
                                offset: 10,
                            }}
                        />
                        <YAxis
                            dataKey="label"
                            type="category"
                            width={340}
                            tick={{ fontSize: 13 }}
                        />
                        <Tooltip formatter={tooltipFormatter} />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: 30 }}
                        />
                        {RANKS.map((rank) => (
                            <Bar
                                key={rank}
                                dataKey={`g${rank}`}
                                name={groupLabels[rank]}
                                stackId="groups"
                                fill={RESISTANCE_GROUP_COLORS[rank]}
                                stroke="#fff"
                                strokeWidth={1}
                                isAnimationActive={false}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <Stack
                direction="row"
                justifyContent="center"
                mt={2}
                mb={1}
                spacing={2}
            >
                <Button
                    onClick={handleDownloadChart}
                    variant="contained"
                    sx={{ background: "#003663", color: "#fff" }}
                >
                    {t("Download_Chart")}
                </Button>
                <Button
                    onClick={handleDownloadData}
                    variant="contained"
                    sx={{ background: "#003663", color: "#fff" }}
                >
                    {t("DOWNLOAD_ZIP_FILE")}
                </Button>
                <Button
                    onClick={handleShareLink}
                    variant="contained"
                    sx={{ background: "#003663", color: "#fff" }}
                    startIcon={<InsertLinkIcon />}
                >
                    {t("Share_Link")}
                </Button>
            </Stack>

            {copied && (
                <Typography
                    color="success.main"
                    textAlign="center"
                    mt={1}
                    fontWeight="bold"
                >
                    {t("Link copied to clipboard!")}
                </Typography>
            )}
        </Box>
    );
};
