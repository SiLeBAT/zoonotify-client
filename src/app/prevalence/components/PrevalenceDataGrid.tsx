import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line import/named
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Link, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import { DataGridControls } from "./DataGridControls";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import JSZip from "jszip";
import { PrevalenceEntry, usePrevalenceFilters } from "./PrevalenceDataContext";
import { PrevalenceChart } from "./PrevalenceChart";
import { createTheme, ThemeProvider } from "@mui/material/styles";

interface PrevalenceDataGridProps {
    prevalenceData: PrevalenceEntry[];
    loading: boolean;
    language: "de" | "en";
}

const italicWords: string[] = [
    "Salmonella",
    "coli",
    "E.",
    "Bacillus",
    "cereus",
    "monocytogenes",
    "Clostridioides",
    "difficile",
    "Yersinia",
    "Listeria",
    "enterocolitica",
    "Vibrio",
    "Baylisascaris",
    "procyonis",
    "Echinococcus",
    "Campylobacter",
];
const GERMAN_README = `
Dieser ZooNotify-Daten-Download enthält diese README-Datei, zwei CSV-Dateien und eine zusätzliche Textdatei. Der Inhalt und die Verwendung dieser Dateien wird im Folgenden erläutert.

prevalence_data_dot.csv: für Software mit deutschen Spracheinstellungen 
Diese Datei enthält punktgetrennte Daten, die das korrekte Zahlenformat in Softwareprogrammen (wie Microsoft Office Excel oder LibreOffice Sheets) mit deutschen Spracheinstellungen unterstützen. Diese Datei kann in Programmen geöffnet werden, die Kommas als Dezimaltrennzeichen verwenden. 

prevalence_data_comma.csv: für Software mit englischen Spracheinstellungen 
Diese Datei enthält kommagetrennte Daten, die das korrekte Zahlenformat in Softwareprogrammen (wie Microsoft Office Excel oder LibreOffice Sheets) mit englischen Spracheinstellungen unterstützen. Diese Datei kann in Programmen geöffnet werden, die Punkte als Dezimaltrennzeichen verwenden. 

search_parameters.txt
In der Textdatei search_parameters.txt finden Sie Informationen zu den Parametern, die Sie im Suchmenü von ZooNotify ausgewählt haben, bevor Sie die Daten heruntergeladen haben. Die heruntergeladenen CSV-Dateien enthalten nur Daten, die mit den in der Datei search_parameters.txt angegebenen Suchkriterien übereinstimmen.
`;

const ENGLISH_README = `
This ZooNotify data download contains this README-file, two CSV-files and one additional text file. The content and use of these files is explained below.

prevalence_data_dot.csv: for software with German language settings
This file contains dot-separated data, which supports the correct format of numbers in software programmes (like Microsoft Office Excel or LibreOffice Sheets) with German language settings. This file can be opened in software which use commas as decimal separators.

prevalence_data_comma.csv: for software with English language settings
This file contains comma-separated data, which supports the correct format of numbers in software programmes (like Microsoft Office Excel or LibreOffice Sheets) with English language settings. This file can be opened in software which use dots as decimal separators.

search_parameters.txt
In the text file search_parameters.txt you will find information about the parameters you have selected in the search menu on ZooNotify before you downloaded the data. The downloaded CSV-files only contain data that matches the search criteria specified in the search_parameters.txt file.
`;
const formatMicroorganismName = (
    microName: string | null | undefined
): JSX.Element => {
    if (!microName) {
        console.warn("Received null or undefined microorganism name");
        return <></>;
    }
    const words = microName
        .split(/(\s+|-)/)
        .filter((part: string) => part.trim().length > 0);
    return words
        .map((word: string, index: number) => {
            const italic = italicWords.some((italicWord: string) =>
                word.toLowerCase().includes(italicWord.toLowerCase())
            );
            return italic ? (
                <i key={index}>{word}</i>
            ) : (
                <span key={index}>{word}</span>
            );
        })
        .reduce(
            (prev: JSX.Element, curr: JSX.Element) => (
                <>
                    {prev}
                    {prev ? " " : ""}
                    {curr}
                </>
            ),
            <></>
        );
};
const localTooltipTheme = createTheme({
    components: {
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: "#f0f0f0",
                    color: "#000000",
                    fontSize: "0.810rem",
                    border: "1px solid #000000",
                },
                arrow: {
                    color: "#000000",
                },
            },
        },
    },
});
const PrevalenceDataGrid: React.FC<PrevalenceDataGridProps> = ({
    prevalenceData,
    loading,
    language,
}) => {
    const { t } = useTranslation(["PrevalencePage"]);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [filename, setFilename] = useState<string>("");
    const theme = useTheme();
    const { searchParameters, prevalenceUpdateDate } = usePrevalenceFilters();

    const getFormattedTimestamp = (): string => {
        const date = new Date();
        return date.toISOString().replace(/[:.]/g, "-");
    };

    const formatNumber = (value: number, decimalSeparator: string): string => {
        return value.toString().replace(".", decimalSeparator);
    };

    const createCSVContent = (
        data: PrevalenceEntry[],
        decimalSeparator: string
    ): string => {
        const csvRows: string[] = [];
        const headers: Array<keyof PrevalenceEntry> = [
            "samplingYear",
            "microorganism",
            "sampleOrigin",
            "samplingStage",
            "matrix",
            "numberOfSamples",
            "numberOfPositive",
            "percentageOfPositive",
            "ciMin",
            "ciMax",
        ];

        const headerTranslationKeys: {
            [key in keyof PrevalenceEntry]: string;
        } = {
            id: "ID",
            samplingYear: "SAMPLING_YEAR",
            numberOfSamples: "NUMBER_OF_SAMPLES",
            numberOfPositive: "NUMBER_OF_POSITIVE",
            percentageOfPositive: "PERCENTAGE_OF_POSITIVE",
            ciMin: "CIMIN",
            ciMax: "CIMAX",
            matrix: "MATRIX",
            matrixGroup: "MATRIX_GROUP",
            samplingStage: "SAMPLING_STAGE",
            sampleOrigin: "SAMPLE_ORIGIN",
            microorganism: "MICROORGANISM",
            superCategorySampleOrigin: "SUPER_CATEGORY_SAMPLE_ORIGIN",
        };

        csvRows.push(
            "\uFEFF" +
                headers
                    .map((header) =>
                        t(
                            headerTranslationKeys[header] ||
                                "MISSING_TRANSLATION"
                        )
                    )
                    .join(";")
        );

        data.forEach((row) => {
            const values = headers.map((header) => {
                const value = row[header];
                if (typeof value === "number") {
                    return formatNumber(value, decimalSeparator);
                }
                return `"${value.replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(";"));
        });

        return csvRows.join("\n");
    };

    const prepareDownload = async (): Promise<void> => {
        if (prevalenceData.length === 0) return;

        const zip = new JSZip();
        const timestamp = getFormattedTimestamp();

        // 1) Generate CSV files
        const csvContentDot = createCSVContent(prevalenceData, ".");
        const csvContentComma = createCSVContent(prevalenceData, ",");

        zip.file(`prevalence_data_dot_${timestamp}.csv`, csvContentDot);
        zip.file(`prevalence_data_comma_${timestamp}.csv`, csvContentComma);

        // 2) Add search_parameters.txt
        const searchParamsJson = JSON.stringify(searchParameters, null, 2);
        const formattedText = `Search Parameters - Generated on ${timestamp}\n\n${searchParamsJson
            .split("\n")
            .map((line) => {
                if (line.includes("{")) return line;
                const keyMatch = line.match(/"(.*?)":/);
                if (keyMatch) {
                    const key = keyMatch[1];
                    return `\n--- ${key.toUpperCase()} ---\n${line}`;
                }
                return line;
            })
            .join("\n")}`;

        // 3) Pick the correct README text without i18n
        const readmeContent =
            language?.toLowerCase() === "de" ? GERMAN_README : ENGLISH_README;

        zip.file(`search_parameters_${timestamp}.txt`, formattedText);
        zip.file(`README_${timestamp}.txt`, readmeContent);
        // 4) Generate the blob
        const blob = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(blob);

        setDownloadUrl(url);
        setFilename(`data_package_${timestamp}.zip`);
    };

    useEffect(() => {
        if (prevalenceData.length > 0) {
            prepareDownload();
        }
    }, [prevalenceData, searchParameters]);

    const columns: GridColDef[] = [
        {
            field: "samplingYear",
            headerName: t("SAMPLING_YEAR"),
            minWidth: 130,
            flex: 1,
            headerClassName: "header-style",
            align: "left", // Align cell content to the left
            headerAlign: "left", // Align header text to the left
        },
        {
            field: "microorganism",
            headerName: t("MICROORGANISM"),
            minWidth: 140,
            flex: 1,
            headerClassName: "header-style",
            align: "left",
            headerAlign: "left",
            renderCell: (params) => formatMicroorganismName(params.value),
        },
        {
            field: "sampleOrigin",
            headerName: t("SAMPLE_ORIGIN"),
            minWidth: 140,
            flex: 1,
            headerClassName: "header-style",
            align: "left",
            headerAlign: "left",
        },
        {
            field: "samplingStage",
            headerName: t("SAMPLING_STAGE"),
            minWidth: 150,
            flex: 1,
            headerClassName: "header-style",
            align: "left",
            headerAlign: "left",
        },
        {
            field: "matrix",
            headerName: t("MATRIX"),
            minWidth: 120,
            flex: 1,
            headerClassName: "header-style",
            align: "left",
            headerAlign: "left",
        },
        {
            field: "numberOfSamples",
            headerName: t("NUMBER_OF_SAMPLES"),
            type: "number",
            minWidth: 170,
            flex: 1,
            headerClassName: "header-style",
            align: "left",
            headerAlign: "left",
        },
        {
            field: "numberOfPositive",
            headerName: t("NUMBER_OF_POSITIVE"),
            type: "number",
            minWidth: 150,
            flex: 1,
            headerClassName: "header-style",
            align: "left",
            headerAlign: "left",
        },
        {
            field: "percentageOfPositive",
            headerName: t("PERCENTAGE_OF_POSITIVE"),
            type: "number",
            valueGetter: (value: number) => `${value.toFixed(2)}`,
            minWidth: 150,
            flex: 1,
            headerClassName: "header-style",
            align: "left",
            headerAlign: "left",
        },
        {
            field: "ciMin",
            headerName: t("CIMIN"),
            type: "number",
            valueGetter: (value: number) =>
                value != null ? value.toFixed(2) : "N/A",
            minWidth: 150,
            flex: 1,
            headerClassName: "header-style",
            align: "left",
            headerAlign: "left",
        },
        {
            field: "ciMax",
            headerName: t("CIMAX"),
            type: "number",
            valueGetter: (value: number) =>
                value != null ? value.toFixed(2) : "N/A",
            minWidth: 130,
            flex: 1,
            headerClassName: "header-style",
            align: "left",
            headerAlign: "left",
        },
    ];

    return (
        <>
            <div style={{ marginBottom: "10px" }}>
                <DataGridControls heading={t("TABLE_DETAIL")} />
            </div>
            <ZNAccordion
                title={t("PREVALENCE_TABLE")}
                content={
                    <div
                        style={{
                            height: 600,
                            width: "100%",
                            overflowX: "auto",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Place the LAST_UPDATE_DATE at the top of the grid section */}
                        <Typography
                            variant="subtitle1"
                            style={{
                                marginBottom: "10px",
                                fontSize: "0.875rem", // Adjusted font size
                                color: theme.palette.text.secondary, // Optional for subtle styling
                            }}
                        >
                            {t("Generated on")}:{" "}
                            {prevalenceUpdateDate || t("No date available")}
                        </Typography>

                        <ThemeProvider theme={localTooltipTheme}>
                            <DataGrid
                                rows={prevalenceData}
                                columns={columns}
                                loading={loading}
                                disableColumnFilter={true}
                                hideFooter={false}
                                localeText={{
                                    // This is the key that ensures the sort icon uses a MUI Tooltip
                                    columnHeaderSortIconLabel: "Sort",
                                }}
                                sx={{
                                    backgroundColor: "white",
                                    border: 2,
                                    borderColor: "primary.main",

                                    "& .header-style": {
                                        fontWeight: "bold",
                                        whiteSpace: "normal !important",
                                        wordWrap: "break-word !important",
                                        fontSize: "1rem",
                                        textAlign: "center",
                                        backgroundColor:
                                            theme.palette.primary.light,
                                        color: theme.palette.primary
                                            .contrastText,
                                        border: "1px solid #e0e0e0",
                                    },
                                    "& .MuiDataGrid-root": {
                                        borderWidth: "1px",
                                        borderColor: "rgba(224, 224, 224, 1)",
                                    },
                                    "& .MuiDataGrid-cell": {
                                        border: "1px solid #e0e0e0",
                                        textAlign: "center",
                                    },
                                    "& .MuiDataGrid-columnHeaders": {
                                        borderBottom: "1px solid #e0e0e0",
                                        borderRight: "1px solid #e0e0e0",
                                    },
                                    "& .MuiDataGrid-columnSeparator": {
                                        visibility: "hidden",
                                    },
                                    "& .MuiDataGrid-row": {
                                        borderBottom: "1px solid #e0e0e0",
                                    },

                                    // --- ICON & HOVER STYLES YOU WANT TO OVERRIDE ---
                                    "& .MuiDataGrid-iconButtonContainer:hover":
                                        {
                                            backgroundColor:
                                                "rgba(0, 0, 0, 0.3)", // or 'transparent' to remove hover
                                        },
                                    "& .MuiDataGrid-menuIconButton:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.3)", // unify with the same style
                                    },
                                    // Optionally target the sort icon directly
                                    "& .MuiDataGrid-sortIcon:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                                    },

                                    // Change the icon colors (for the default state) if needed
                                    "& .MuiDataGrid-iconButtonContainer": {
                                        color: "#ffffff",
                                    },
                                    "& .MuiDataGrid-menuIconButton": {
                                        color: "#ffffff !important",
                                    },
                                    "& .MuiSvgIcon-root": {
                                        color: "#ffffff",
                                    },
                                    "& .MuiTooltip-tooltip": {
                                        backgroundColor: "#f0f0f0", // light gray
                                        color: "#000000", // black text
                                        fontSize: "1rem",
                                    },
                                }}
                            />
                        </ThemeProvider>
                        {downloadUrl && (
                            <Button
                                variant="contained"
                                color="primary"
                                style={{
                                    margin: "0.5em",
                                    backgroundColor: theme.palette.primary.main,
                                }}
                            >
                                <Link
                                    href={downloadUrl}
                                    download={filename}
                                    style={{
                                        width: "100%",
                                        padding: "0.5em 1em",
                                        color: "inherit",
                                        textDecoration: "none",
                                    }}
                                >
                                    {t("DOWNLOAD_ZIP_FILE")}
                                </Link>
                            </Button>
                        )}
                    </div>
                }
                defaultExpanded={true}
                centerContent={false}
                withTopBorder={false}
            />
            <div style={{ height: "10px" }}></div>
            <ZNAccordion
                title={t("PREVALENCE_CHART")}
                content={
                    <div
                        style={{
                            maxHeight: "950px",
                            width: "100%",
                            overflow: "hidden",
                            flexDirection: "column",
                        }}
                    >
                        <div style={{ height: "100%", width: "100%" }}>
                            <PrevalenceChart />
                        </div>
                    </div>
                }
                defaultExpanded={true}
                centerContent={false}
                withTopBorder={false}
            />
        </>
    );
};

export { PrevalenceDataGrid };
