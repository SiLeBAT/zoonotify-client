import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { Box, Button, Stack, Typography } from "@mui/material";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import React, { useRef } from "react";
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
import { ResistanceApiItem } from "./TrendDetails";

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

export function getGroupKey(
    r: ResistanceApiItem,
    microorganism: string
): string {
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
    selectedCombinations: string[];
    groupLabel?: React.ReactNode;
}

type CsvHeaderKey =
    | "samplingYear"
    | "superCategorySampleOrigin"
    | "sampleOrigin"
    | "samplingStage"
    | "matrixGroup"
    | "matrix"
    | "antimicrobialSubstance"
    | "specie"
    | "resistenzrate"
    | "anzahlGetesteterIsolate"
    | "anzahlResistenterIsolate"
    | "minKonfidenzintervall"
    | "maxKonfidenzintervall";

const CSV_HEADERS: CsvHeaderKey[] = [
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
];

// ✅ Consistent, human-readable CSV header labels (same language per download)
const CSV_HEADER_LABELS: Record<"en" | "de", Record<CsvHeaderKey, string>> = {
    en: {
        samplingYear: "Sampling year",
        superCategorySampleOrigin: "Super-category sample origin",
        sampleOrigin: "Sample origin",
        samplingStage: "Sampling stage",
        matrixGroup: "Matrix group",
        matrix: "Matrix",
        antimicrobialSubstance: "Antimicrobial substance",
        specie: "Species",
        resistenzrate: "Resistance rate", // ✅ required by your task
        anzahlGetesteterIsolate: "Number of tested isolates", // ✅ required by your task
        anzahlResistenterIsolate: "Number of resistant isolates",
        minKonfidenzintervall: "Minimum confidence interval",
        maxKonfidenzintervall: "Maximum confidence interval",
    },
    de: {
        samplingYear: "Probenjahr",
        superCategorySampleOrigin: "Oberkategorie Probenherkunft",
        sampleOrigin: "Probenherkunft",
        samplingStage: "Probenahmestufe",
        matrixGroup: "Matrixgruppe",
        matrix: "Matrix",
        antimicrobialSubstance: "Antimikrobielle Substanz",
        specie: "Spezies",
        resistenzrate: "Resistenzrate",
        anzahlGetesteterIsolate: "Anzahl getesteter Isolate",
        anzahlResistenterIsolate: "Anzahl resistenter Isolate",
        minKonfidenzintervall: "Minimales Konfidenzintervall",
        maxKonfidenzintervall: "Maximales Konfidenzintervall",
    },
};

export const SubstanceChart: React.FC<SubstanceChartProps> = ({
    data,
    year,
    microorganism,
    selectedCombinations,
    groupLabel,
}) => {
    const { t, i18n } = useTranslation(["Antibiotic"]);
    const chartRef = useRef<HTMLDivElement>(null);
    const fixedSizeChartRef = useRef<HTMLDivElement>(null);

    // Decide export language (keep it simple & consistent)
    const exportLang: "en" | "de" = i18n.language
        ?.toLowerCase()
        .startsWith("de")
        ? "de"
        : "en";

    // Prepare data for the current year & visibility rules used by the chart
    const filtered = data.filter(
        (d) =>
            d.samplingYear === year &&
            d.anzahlGetesteterIsolate != null &&
            d.anzahlGetesteterIsolate >= 10
    );

    // These are the substances actually plotted (already upstream-filtered)
    const substances = Array.from(
        new Set(
            filtered.map((d) => d.antimicrobialSubstance?.name).filter(Boolean)
        )
    ).sort();

    // Only include user-selected combinations (max 4) in the chart
    const groupKeys = Array.from(
        new Set(filtered.map((d) => getGroupKey(d, microorganism)))
    ).filter((key) => selectedCombinations.includes(key));

    const groupColors: { [key: string]: string } = {};
    groupKeys.forEach((key, i) => {
        groupColors[key] = BAR_COLORS[i % BAR_COLORS.length];
    });

    const legendLabels: { [key: string]: string } = {};
    groupKeys.forEach((key) => {
        legendLabels[key] = key;
    });

    const [copied, setCopied] = React.useState(false);
    const handleShareLink = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    // Map group -> N (first found row for the group)
    const nPerGroup: { [key: string]: number | undefined } = {};
    groupKeys.forEach((groupKey) => {
        const row = filtered.find(
            (d) => getGroupKey(d, microorganism) === groupKey
        );
        nPerGroup[groupKey] = row?.anzahlGetesteterIsolate ?? undefined;
    });

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
                        (N={N ?? "?"})
                    </span>
                </span>
            );
        }
        return (
            <span>
                {value}
                <span style={{ color: "#888", fontWeight: 400 }}>
                    {" "}
                    (N={N ?? "?"})
                </span>
            </span>
        );
    };

    // Build the rows used by the chart (visible bars)
    const chartData = substances.map((substance) => {
        const row: Record<string, unknown> = { substance };
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

    // ---------- EXPORTS ----------
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

    function getCsvHeaderLabel(key: CsvHeaderKey): string {
        return CSV_HEADER_LABELS[exportLang][key] ?? key;
    }

    function generateCSV(
        rows: ResistanceApiItem[],
        sep: "," | ";",
        decimalSep: "." | ","
    ): string {
        if (!rows || !rows.length) return "";

        function valueForCSV(row: ResistanceApiItem, h: CsvHeaderKey): string {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const raw: any = (row as any)[h];

            if (raw == null) return "";

            if (typeof raw === "number") {
                let n = raw.toString();
                if (decimalSep === ",") n = n.replace(".", ",");
                return n;
            }

            // unwrap common Strapi-ish objects with a 'name' field
            if (typeof raw === "object") {
                const maybeName = (raw as { name?: unknown }).name;
                const str =
                    maybeName != null ? String(maybeName) : JSON.stringify(raw);
                if (
                    str.includes(sep) ||
                    str.includes('"') ||
                    str.includes("\n")
                ) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }

            const s = String(raw);
            if (s.includes(sep) || s.includes('"') || s.includes("\n")) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        }

        // ✅ Header row is now guaranteed: same language + consistent formatting
        const headerRow = CSV_HEADERS.map((h) => getCsvHeaderLabel(h)).join(
            sep
        );

        const csvRows = [
            headerRow,
            ...rows.map((row) =>
                CSV_HEADERS.map((h) => valueForCSV(row, h)).join(sep)
            ),
        ];
        return csvRows.join("\n");
    }

    async function downloadZipWithCSVs(
        rows: ResistanceApiItem[]
    ): Promise<void> {
        const timestamp = getFormattedTimestamp();
        const zip = new JSZip();

        const csvComma = generateCSV(rows, ",", ".");
        const csvDot = generateCSV(rows, ";", ",");

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

    // rows that exactly match what the chart is showing
    const visibleSubstanceNames = new Set(substances);
    const rowsForCsv = filtered.filter((d) => {
        const gk = getGroupKey(d, microorganism);
        const subName = d.antimicrobialSubstance?.name ?? "";
        return (
            selectedCombinations.includes(gk) &&
            visibleSubstanceNames.has(subName)
        );
    });

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
                {/* Title */}
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
                        {groupLabel || (
                            <>
                                {year},{" "}
                                <FormattedMicroorganismName
                                    microName={microorganism}
                                    fontWeight="bold"
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

                {/* Chart */}
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={550}>
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            barCategoryGap="65%"
                            barGap={4}
                            margin={{
                                top: 10,
                                right: 25,
                                left: 20,
                                bottom: 40,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tickFormatter={(v: number) => `${v}%`}
                                label={{
                                    value: t("PROPORTION_RESISTANT_ISOLATES"),
                                    position: "bottom",
                                    offset: 10,
                                }}
                            />
                            <YAxis
                                dataKey="substance"
                                type="category"
                                width={90}
                                label={{
                                    value: t("TESTED_SUBSTANCES"),
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
                                    stroke="#fff"
                                    strokeWidth={1}
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
                            {t("Not enough data to display the chart")}
                        </Typography>
                    </Box>
                )}
            </div>

            {/* Off-screen fixed-size chart for PNG export */}
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
                        {groupLabel || (
                            <>
                                {year},{" "}
                                <FormattedMicroorganismName
                                    microName={microorganism}
                                    fontWeight="bold"
                                    fontSize="inherit"
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
                        barCategoryGap="35%"
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
                                paddingLeft: 10,
                                width: 400,
                                top: 0,
                                right: 0,
                                bottom: 0,
                                background: "transparent",
                                borderRadius: 0,
                                boxShadow: "none",
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
                    onClick={() => downloadZipWithCSVs(rowsForCsv)}
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
                    {t("Share_Link") || "Share Link"}
                </Button>
            </Stack>

            {copied && (
                <Typography
                    color="success.main"
                    textAlign="center"
                    mt={1}
                    fontWeight="bold"
                >
                    {t("Link copied to clipboard!") ||
                        "Link copied to clipboard!"}
                </Typography>
            )}
        </Box>
    );
};
