import React, { useRef } from "react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Typography, Button, Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ResistanceApiItem } from "./TrendDetails";
import { FormattedMicroorganismName } from "./AntibioticResistancePage.component";

const BAR_COLORS = [
    "#F08080",
    "#4682B4",
    "#B8860B",
    "#8FBC8F",
    "#00CED1",
    "#4169E1",
    "#9932CC",
    "#2E8B57",
    "#B22222",
    "#FFD700",
    "#DC143C",
    "#556B2F",
    "#40E0D0",
    "#3CB371",
    "#DA70D6",
    "#FFA07A",
    "#6A5ACD",
    "#CD5C5C",
    "#008080",
    "#FF6347",
];

function getGroupKey(r: ResistanceApiItem, microorganism: string): string {
    let key = "";
    if (
        microorganism === "Campylobacter spp." ||
        microorganism === "Enterococcus spp."
    ) {
        key = [
            r.specie?.name ?? "",
            r.matrix?.name ?? "",
            r.sampleOrigin?.name ?? "",
            r.samplingStage?.name ?? "",
        ].join(" | ");
    } else {
        key = [
            r.matrix?.name ?? "",
            r.sampleOrigin?.name ?? "",
            r.samplingStage?.name ?? "",
        ].join(" | ");
    }
    return key;
}

interface SubstanceChartProps {
    data: ResistanceApiItem[];
    year: number;
    microorganism: string;
    groupLabel?: React.ReactNode;
}

export const SubstanceChart: React.FC<SubstanceChartProps> = ({
    data,
    year,
    microorganism,
    groupLabel,
}) => {
    const { t } = useTranslation(["Antibiotic"]);
    const chartRef = useRef<HTMLDivElement>(null);
    const fixedSizeChartRef = useRef<HTMLDivElement>(null);

    // Prepare data
    const filtered = data.filter(
        (d) =>
            d.samplingYear === year &&
            d.anzahlGetesteterIsolate != null &&
            d.anzahlGetesteterIsolate >= 10
    );

    const substances = Array.from(
        new Set(
            filtered.map((d) => d.antimicrobialSubstance?.name).filter(Boolean)
        )
    ).sort();

    const groupKeys = Array.from(
        new Set(filtered.map((d) => getGroupKey(d, microorganism)))
    );

    const groupColors: { [key: string]: string } = {};
    groupKeys.forEach((key, i) => {
        groupColors[key] = BAR_COLORS[i % BAR_COLORS.length];
    });

    const legendLabels: { [key: string]: string } = {};
    groupKeys.forEach((key) => {
        legendLabels[key] = key;
    });

    // --- For each groupKey, get the first available N for the groupKey ---
    const nPerGroup: { [key: string]: number | undefined } = {};
    groupKeys.forEach((groupKey) => {
        // Find first filtered row for this groupKey and get its N
        const row = filtered.find(
            (d) => getGroupKey(d, microorganism) === groupKey
        );
        nPerGroup[groupKey] = row?.anzahlGetesteterIsolate ?? undefined;
    });

    // --- Legend label formatter with correct N (unique for group) ---
    const legendFormatter = (value: string): React.ReactNode => {
        const N = nPerGroup[value];
        if (
            microorganism === "Campylobacter spp." ||
            microorganism === "Enterococcus spp."
        ) {
            const parts = value.split(" | ");
            const species = parts[0];
            const rest = parts.slice(1).join(" | ");
            return (
                <span>
                    <FormattedMicroorganismName
                        microName={species}
                        fontWeight="normal"
                        fontSize="inherit"
                    />
                    {rest && (
                        <>
                            {" | "}
                            {rest}
                        </>
                    )}
                    <span style={{ color: "#888", fontWeight: 400 }}>
                        {" "}
                        (N={N !== undefined && N !== null ? N : "?"})
                    </span>
                </span>
            );
        }
        return (
            <span>
                {value}
                <span style={{ color: "#888", fontWeight: 400 }}>
                    {" "}
                    (N={N !== undefined && N !== null ? N : "?"})
                </span>
            </span>
        );
    };

    const chartData = substances.map((substance) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row: any = { substance };
        groupKeys.forEach((groupKey) => {
            const found = filtered.find(
                (d) =>
                    d.antimicrobialSubstance?.name === substance &&
                    getGroupKey(d, microorganism) === groupKey
            );
            if (found) {
                row[groupKey] = found.resistenzrate;
                row[`N_${groupKey}`] = found.anzahlGetesteterIsolate;
            } else {
                row[groupKey] = null;
                row[`N_${groupKey}`] = null;
            }
        });
        return row;
    });

    // Download handlers and CSV as before...
    const handleDownloadChart = async (): Promise<void> => {
        if (fixedSizeChartRef.current) {
            const canvas = await html2canvas(fixedSizeChartRef.current, {
                backgroundColor: "#fff",
                useCORS: true,
                scale: 1,
                width: 1200,
                height: 600,
            });
            const link = document.createElement("a");
            link.download = `substance_chart_${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
        }
    };

    function getFormattedTimestamp(): string {
        const d = new Date();
        return d
            .toISOString()
            .replace(/:/g, "-")
            .replace(/\..+/, "")
            .replace("T", "_");
    }

    function generateCSV(
        rows: ResistanceApiItem[],
        sep: "," | ";",
        decimalSep: "." | ",",
        translate: (key: string) => string
    ): string {
        if (!rows || !rows.length) return "";
        const headers = [
            "samplingYear",
            "superCategorySampleOrigin",
            "sampleOrigin",
            "samplingStage",
            "matrixGroup",
            "matrix",
            "antimicrobialSubstance",
            "specie",
            "resistenzrate",
            "anzahlGetesteterIsolate",
            "anzahlResistenterIsolate",
            "minKonfidenzintervall",
            "maxKonfidenzintervall",
        ] as const;

        function valueForCSV(
            row: ResistanceApiItem,
            h: typeof headers[number]
        ): string {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let v = (row as any)[h];
            if (v && typeof v === "object") {
                if ("name" in v) v = v.name;
                else v = JSON.stringify(v);
            }
            if (v == null) return "";
            if (typeof v === "number") {
                let valStr = v.toString();
                if (decimalSep === ",") valStr = valStr.replace(".", ",");
                return valStr;
            }
            let vStr = String(v);
            if (
                vStr.includes(sep) ||
                vStr.includes('"') ||
                vStr.includes("\n")
            ) {
                vStr = `"${vStr.replace(/"/g, '""')}"`;
            }
            return vStr;
        }

        const headerRow = headers.map((h) => translate(h) || h).join(sep);
        const csvRows = [
            headerRow,
            ...rows.map((row) =>
                headers.map((h) => valueForCSV(row, h)).join(sep)
            ),
        ];
        return csvRows.join("\n");
    }

    async function downloadZipWithCSVs(
        rows: ResistanceApiItem[]
    ): Promise<void> {
        const timestamp = getFormattedTimestamp();
        const zip = new JSZip();

        const csvComma = generateCSV(rows, ",", ".", t);
        const csvDot = generateCSV(rows, ";", ",", t);

        const readmeContentEn = `   
This ZooNotify data download contains this README-file and two CSV-files. The use of these CSV-files is explained below.

The data_dot.csv: Is for use in software with German language settings
This file contains dot-separated data, which supports the correct format of numbers in software programmes (like Microsoft Office Excel or LibreOffice Sheets) with German language settings. This file can be opened in software which use commas as decimal separators.

The data_comma.csv: Is for use in software with English language settings
This file contains comma-separated data, which supports the correct format of numbers in software programmes (like Microsoft Office Excel or LibreOffice Sheets) with English language settings. This file can be opened in software which use dots as decimal separators.
        `;

        zip.file(`substance_comma_${timestamp}.csv`, csvComma);
        zip.file(`substance_dot_${timestamp}.csv`, csvDot);
        zip.file("README.txt", readmeContentEn);

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `substance_data_${timestamp}.zip`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // FIXED TOOLTIP FORMATTER -- always shows correct N!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tooltipFormatter = (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any,
        name: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props: any
    ): [string, string] => {
        let N: number | undefined = undefined;
        if (props && props.payload) {
            const nVal = props.payload[`N_${name}`];
            if (nVal !== undefined && nVal !== null) N = nVal;
        }
        return [
            value !== null && value !== undefined
                ? value.toFixed(1) + " %"
                : "-",
            `${name} (N=${N !== undefined && N !== null ? N : "?"})`,
        ];
    };

    // UI
    return (
        <Box>
            <div
                ref={chartRef}
                style={{
                    padding: "32px",
                    background: "#fff",
                    borderRadius: "16px",
                    position: "relative",
                    overflow: "visible",
                    minHeight: "160px",
                }}
            >
                {/* --- LABEL --- */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                    width="100%"
                >
                    <Typography
                        variant="h6"
                        sx={{
                            color: "#003663",
                            fontWeight: "bold",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            maxWidth: "100%",
                            textAlign: "left",
                            lineHeight: 1.25,
                            minHeight: "40px",
                        }}
                    >
                        {/* 👇 Chart title with beautiful microorganism name! */}
                        {groupLabel || (
                            <>
                                {year},{" "}
                                <FormattedMicroorganismName
                                    microName={microorganism}
                                />
                            </>
                        )}
                    </Typography>
                    <img
                        src="/assets/bfr_logo.png"
                        alt="BfR Logo"
                        style={{
                            width: 90,
                            height: "auto",
                            opacity: 0.93,
                            marginLeft: 12,
                        }}
                    />
                </Box>
                {/* --- BAR CHART --- */}
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 25,
                                left: 20,
                                bottom: 40,
                            }} // add right margin!
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tickFormatter={(v: number) => `${v}%`}
                                label={{
                                    value: t(
                                        "Percentage of resistant isolates (%)"
                                    ),
                                    position: "bottom",
                                    offset: 10,
                                }}
                            />
                            <YAxis
                                dataKey="substance"
                                type="category"
                                width={90}
                                label={{
                                    value: t("Substances tested"),
                                    angle: -90,
                                    position: "insideLeft",
                                }}
                            />
                            <Tooltip formatter={tooltipFormatter} />
                            <Legend
                                verticalAlign="middle"
                                align="right"
                                layout="vertical"
                                wrapperStyle={{
                                    paddingLeft: 24,
                                    width: 400,
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: "#fff",
                                    borderRadius: 8,
                                    boxShadow: "0 0 4px #eee",
                                }}
                                formatter={legendFormatter}
                            />
                            {groupKeys.map((groupKey) => (
                                <Bar
                                    key={groupKey}
                                    dataKey={groupKey}
                                    name={legendLabels[groupKey]}
                                    fill={groupColors[groupKey]}
                                    barSize={22}
                                    isAnimationActive={false}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight={300}
                    >
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            align="center"
                            sx={{ fontStyle: "italic", fontSize: "1.15rem" }}
                        >
                            {t("Not enough data to display the chart.")}
                        </Typography>
                    </Box>
                )}
            </div>

            {/* Off-screen for export */}
            <div
                ref={fixedSizeChartRef}
                style={{
                    width: "1200px",
                    height: "600px",
                    position: "absolute",
                    left: "-9999px",
                    top: 0,
                    pointerEvents: "none",
                    background: "#fff",
                    zIndex: -1,
                }}
            >
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                    width="100%"
                >
                    <Typography
                        variant="h6"
                        sx={{
                            color: "#003663",
                            fontWeight: "bold",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            maxWidth: "100%",
                            textAlign: "left",
                            lineHeight: 1.25,
                            minHeight: "40px",
                        }}
                    >
                        {/* 👇 Chart title with beautiful microorganism name! */}
                        {groupLabel || (
                            <>
                                {year},{" "}
                                <FormattedMicroorganismName
                                    microName={microorganism}
                                />
                            </>
                        )}
                    </Typography>
                    <img
                        src="/assets/bfr_logo.png"
                        alt="BfR Logo"
                        style={{
                            width: 90,
                            height: "auto",
                            opacity: 0.93,
                            marginLeft: 12,
                        }}
                    />
                </Box>
                {chartData.length > 0 ? (
                    <BarChart
                        layout="vertical"
                        width={1200}
                        height={500}
                        data={chartData}
                        margin={{ top: 10, right: 60, left: 20, bottom: 40 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={(v: number) => `${v}%`}
                            label={{
                                value: t(
                                    "Percentage of resistant isolates (%)"
                                ),
                                position: "bottom",
                                offset: 10,
                            }}
                        />
                        <YAxis
                            dataKey="substance"
                            type="category"
                            width={90}
                            label={{
                                value: t("Substances tested"),
                                angle: -90,
                                position: "insideLeft",
                            }}
                        />
                        <Tooltip formatter={tooltipFormatter} />
                        <Legend formatter={legendFormatter} />
                        {groupKeys.map((groupKey) => (
                            <Bar
                                key={groupKey}
                                dataKey={groupKey}
                                name={legendLabels[groupKey]}
                                fill={groupColors[groupKey]}
                                barSize={22}
                                isAnimationActive={false}
                            />
                        ))}
                    </BarChart>
                ) : null}
            </div>

            {/* DOWNLOAD BUTTONS */}
            <Stack
                direction="row"
                justifyContent="center"
                mt={2}
                mb={1}
                spacing={2}
            >
                {chartData.length > 0 && (
                    <Button
                        onClick={handleDownloadChart}
                        variant="contained"
                        sx={{ background: "#003663", color: "#fff" }}
                    >
                        {t("Download_Chart")}
                    </Button>
                )}
                <Button
                    onClick={() => downloadZipWithCSVs(filtered)}
                    variant="contained"
                    sx={{ background: "#003663", color: "#fff" }}
                >
                    {t("DOWNLOAD_ZIP_FILE")}
                </Button>
            </Stack>
        </Box>
    );
};
