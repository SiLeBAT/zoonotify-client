import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { Box, Button, Stack, Typography } from "@mui/material";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    CartesianGrid,
    Label,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ResistanceApiItem } from "./TrendDetails";

export interface TrendChartProps {
    data: {
        samplingYear: number;
        resistenzrate: number;
        antimicrobialSubstance: string;
        anzahlGetesteterIsolate?: number;
    }[];
    fullData: ResistanceApiItem[];
    groupLabel?: React.ReactNode;
}

const ALL_SUBSTANCES = [
    "AK",
    "AMP",
    "AZI",
    "CHL",
    "CIP",
    "CLI",
    "COL",
    "DAP",
    "ERY",
    "ETP",
    "FFN",
    "FOT",
    "FOX",
    "FUS",
    "GEN",
    "KAN",
    "LZD",
    "MERO",
    "MUP",
    "NAL",
    "PEN",
    "RIF",
    "SMX",
    "STR",
    "SYN",
    "TAZ",
    "TEC",
    "TET",
    "TGC",
    "TIA",
    "TMP",
    "VAN",
];
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
const SUBSTANCE_COLORS: { [substance: string]: string } = {};
ALL_SUBSTANCES.forEach((substance, idx) => {
    SUBSTANCE_COLORS[substance] = COLORS[idx % COLORS.length];
});

// OVERRIDE colors for CIP, GEN, NAL to be more different
SUBSTANCE_COLORS.CIP = "#e41a1c"; // bright red
SUBSTANCE_COLORS.GEN = "#377eb8"; // strong blue

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomXAxisTick = (chartData: any[]) => (props: any) => {
    const { x, y, payload } = props;
    const entry = chartData.find((e) => e.samplingYear === payload.value);
    let nValue = "-";
    if (
        entry &&
        entry.anzahlGetesteterIsolate != null &&
        entry.anzahlGetesteterIsolate !== ""
    ) {
        nValue = entry.anzahlGetesteterIsolate;
    }
    return (
        <g>
            <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                fill="#888"
                fontSize={12}
            >
                {payload.value}
            </text>
            <text x={x} y={y + 28} textAnchor="middle" fill="#888" fontSize={9}>
                N = {nValue}
            </text>
        </g>
    );
};

export const TrendChart: React.FC<TrendChartProps> = ({
    data,
    fullData,
    groupLabel,
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const fixedSizeChartRef = useRef<HTMLDivElement>(null);
    const { t, i18n } = useTranslation(["Antibiotic"]);
    const [copied, setCopied] = useState(false);
    // -- Chart data preparation
    const yearRange = data.map((entry) => entry.samplingYear);
    const yearMin = Math.min(...yearRange);
    const yearMax = Math.max(...yearRange);
    const years = Array.from(
        { length: yearMax - yearMin + 1 },
        (_, i) => yearMin + i
    );
    // *** FIXED: Use ALL_SUBSTANCES order for legend/plot! ***
    const substances = ALL_SUBSTANCES.filter((substance) =>
        data.some((d) => d.antimicrobialSubstance === substance)
    );

    const chartData = years.map((year) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entry: any = { samplingYear: year };
        const isolatesForYear = data.filter((d) => d.samplingYear === year);
        entry.anzahlGetesteterIsolate =
            isolatesForYear.length > 0
                ? isolatesForYear[0].anzahlGetesteterIsolate
                : null;
        substances.forEach((substance) => {
            const found = data.find(
                (d) =>
                    d.samplingYear === year &&
                    d.antimicrobialSubstance === substance
            );
            if (
                found &&
                found.anzahlGetesteterIsolate != null &&
                found.anzahlGetesteterIsolate >= 10
            ) {
                entry[substance] = found.resistenzrate;
            } else {
                entry[substance] = null;
            }
        });
        return entry;
    });

    // ---- ENOUGH DATA CHECK (show chart if >=2 years with N >= 10)
    const yearsWithEnoughN = Array.from(
        new Set(
            data
                .filter(
                    (d) =>
                        d.anzahlGetesteterIsolate != null &&
                        d.anzahlGetesteterIsolate >= 10
                )
                .map((d) => d.samplingYear)
        )
    );
    const enoughData = yearsWithEnoughN.length >= 2;

    // --- Handlers
    const handleDownload = async (): Promise<void> => {
        if (fixedSizeChartRef.current) {
            const canvas = await html2canvas(fixedSizeChartRef.current, {
                backgroundColor: "#fff",
                useCORS: true,
                scale: 2,
                width: 1300,
                height: 600,
            });
            const link = document.createElement("a");
            link.download = `trend_chart_${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
        }
    };

    const handleShareLink = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (err) {
            // Fallback for older browsers / non-HTTPS
            try {
                const el = document.createElement("textarea");
                el.value = window.location.href;
                el.setAttribute("readonly", "");
                el.style.position = "absolute";
                el.style.left = "-9999px";
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
            } catch (e) {
                console.error("Failed to copy link:", err);
            }
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

    const headerFieldToTKey: Record<string, string> = {
        samplingYear: "SAMPLING_YEAR",
        superCategorySampleOrigin: "SUPER-CATEGORY-SAMPLE-ORIGIN",
        sampleOrigin: "SAMPLE_ORIGIN",
        samplingStage: "SAMPLING_STAGE",
        matrixGroup: "MATRIX_GROUP",
        matrix: "MATRIX",
        antimicrobialSubstance: "ANTIBIOTIC_SUBSTANCE",
        specie: "SPECIES",
        resistenzrate: "Resistenzrate (%)",
        anzahlGetesteterIsolate: "anzahlGetesteterIsolate",
        anzahlResistenterIsolate: "anzahlResistenterIsolate",
        minKonfidenzintervall: "minKonfidenzintervall",
        maxKonfidenzintervall: "maxKonfidenzintervall",
    };
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

        const headerRow = headers
            .map((h) => translate(headerFieldToTKey[h] || h))
            .join(sep);
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

        const readmeContentDe = `
Dieser ZooNotify-Daten-Download enthält diese README-Datei und zwei CSV-Dateien. Die Verwendung der CSV-Dateien wird im Folgenden erläutert.

Die data_dot.csv Datei: Ist für die Nutzung von Software mit deutschen Spracheinstellungen
Diese Datei enthält punktgetrennte Daten, die das korrekte Zahlenformat in Softwareprogrammen (wie Microsoft Office Excel oder LibreOffice Sheets) mit deutschen Spracheinstellungen unterstützen. Diese Datei kann in Programmen geöffnet werden, die Kommas als Dezimaltrennzeichen verwenden.

Die data_comma.csv Datei:  Ist für die Nutzung von Software mit englischen Spracheinstellungen
Diese Datei enthält kommagetrennte Daten, die das korrekte Zahlenformat in Softwareprogrammen (wie Microsoft Office Excel oder LibreOffice Sheets) mit englischen Spracheinstellungen unterstützen. Diese Datei kann in Programmen geöffnet werden, die Punkte als Dezimaltrennzeichen verwenden.
`;
        const readmeContentEn = `
This ZooNotify data download contains this README-file and two CSV-files. The use of these CSV-files is explained below.

The data_dot.csv: Is for use in software with German language settings
This file contains dot-separated data, which supports the correct format of numbers in software programmes (like Microsoft Office Excel or LibreOffice Sheets) with German language settings. This file can be opened in software which use commas as decimal separators.

The data_comma.csv: Is for use in software with English language settings
This file contains comma-separated data, which supports the correct format of numbers in software programmes (like Microsoft Office Excel or LibreOffice Sheets) with English language settings. This file can be opened in software which use dots as decimal separators.
        `;

        const readmeContent = i18n.language.startsWith("de")
            ? readmeContentDe
            : readmeContentEn;

        zip.file(`trend_comma_${timestamp}.csv`, csvComma);
        zip.file(`trend_dot_${timestamp}.csv`, csvDot);
        zip.file("README.txt", readmeContent);

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `trend_data_${timestamp}.zip`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // --- UI ---
    return (
        <Box>
            <div
                ref={chartContainerRef}
                style={{
                    padding: "35px",
                    background: "#fff",
                    borderRadius: "16px",
                    position: "relative",
                    overflow: "visible",
                    minHeight: "160px",
                }}
            >
                {/* ---- ALWAYS SHOW GROUP LABEL & LOGO ---- */}
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
                        {groupLabel}
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

                {/* ---- CHART OR "NOT ENOUGH DATA" MESSAGE ---- */}

                {enoughData ? (
                    <div ref={chartContainerRef}>
                        <ResponsiveContainer width="100%" height={450}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="samplingYear"
                                    height={60}
                                    tick={renderCustomXAxisTick(chartData)}
                                    interval={0}
                                >
                                    <Label
                                        value={t("Year")}
                                        offset={-2}
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
                                        value={t("Resistenzrate (%)")}
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
                                {substances.map((substance) => (
                                    <Line
                                        key={substance}
                                        type="linear"
                                        dataKey={substance}
                                        name={substance}
                                        stroke={
                                            SUBSTANCE_COLORS[substance] ||
                                            "#888"
                                        }
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
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

            {/* Hidden fixed-size chart for download (off-screen, not visible) */}
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
                        {groupLabel}
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
                {enoughData ? (
                    <LineChart width={1200} height={500} data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="samplingYear"
                            height={60}
                            tick={renderCustomXAxisTick(chartData)}
                            interval={0}
                        >
                            <Label
                                value={t("Year")}
                                offset={-2}
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
                                value={t("Resistenzrate (%)")}
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
                        {substances.map((substance) => (
                            <Line
                                key={substance}
                                type="linear"
                                dataKey={substance}
                                name={substance}
                                stroke={SUBSTANCE_COLORS[substance] || "#888"}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                ) : null}
            </div>

            {/* ---- DOWNLOAD BUTTONS ---- */}
            <Stack
                direction="row"
                justifyContent="center"
                mt={2}
                mb={1}
                spacing={2}
            >
                {enoughData && (
                    <Button
                        onClick={handleDownload}
                        variant="contained"
                        sx={{ background: "#003663", color: "#fff" }}
                    >
                        {t("Download_Chart")}
                    </Button>
                )}
                <Button
                    onClick={() => downloadZipWithCSVs(fullData)}
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
