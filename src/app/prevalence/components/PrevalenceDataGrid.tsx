import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line import/named
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Typography, useMediaQuery } from "@mui/material";
import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { DataGridControls } from "./DataGridControls";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import JSZip from "jszip";
import { PrevalenceEntry, usePrevalenceFilters } from "./PrevalenceDataContext";
import { PrevalenceChart } from "./PrevalenceChart";

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

prevalence_data_comma.csv: für Software mit englischen Spracheeinstellungen 
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
    if (!microName) return <></>;
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

    // ✅ Added for Share Link (same logic as your ChartCard)
    //const [ setCopied] = useState(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery("(max-width:1600px)");
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
        // ✅ CSV columns (Matrix Group included, table unchanged)
        const headers: Array<keyof PrevalenceEntry> = [
            "samplingYear",
            "microorganism",
            "sampleOrigin",
            "superCategorySampleOrigin",
            "samplingStage",
            "matrix",
            "matrixGroup", // <-- added for CSV only
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
            superCategorySampleOrigin: "SUPER-CATEGORY-SAMPLE-ORIGIN",
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
                return `"${String(value ?? "").replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(";"));
        });

        return csvRows.join("\n");
    };

    /** Build the ZIP from the *current* grid rows & current search parameters */
    const prepareDownload = async (): Promise<{
        url: string;
        name: string;
    } | null> => {
        if (prevalenceData.length === 0) return null;

        const zip = new JSZip();
        const timestamp = getFormattedTimestamp();

        // CSVs from current rows
        const csvContentDot = createCSVContent(prevalenceData, ".");
        const csvContentComma = createCSVContent(prevalenceData, ",");

        zip.file(`prevalence_data_dot_${timestamp}.csv`, csvContentDot);
        zip.file(`prevalence_data_comma_${timestamp}.csv`, csvContentComma);

        // Search parameters + README
        const searchParamsJson = JSON.stringify(searchParameters, null, 2);
        const formattedText = `Search Parameters - Generated on ${timestamp}\n\n${searchParamsJson}`;
        const readmeContent =
            language?.toLowerCase() === "de" ? GERMAN_README : ENGLISH_README;

        zip.file(`search_parameters_${timestamp}.txt`, formattedText);
        zip.file(`README_${timestamp}.txt`, readmeContent);

        // Blob
        const blob = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(blob);
        const name = `data_package_${timestamp}.zip`;
        return { url, name };
    };

    /** Click handler: build fresh ZIP, revoke old URL, trigger download */
    const handleDownloadClick = async (): Promise<void> => {
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        }
        const res = await prepareDownload();
        if (!res) return;

        setDownloadUrl(res.url);

        // Auto-trigger download
        const a = document.createElement("a");
        a.href = res.url;
        a.download = res.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    /** ✅ Share link handler (copied from your ChartCard logic) */
    const handleShareLink = async (): Promise<void> => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = url;
            ta.setAttribute("readonly", "");
            ta.style.position = "absolute";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand("copy");
            } catch {}
            document.body.removeChild(ta);
        }
    };

    /** Cleanup blob URL on unmount / change */
    useEffect(() => {
        return () => {
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        };
    }, [downloadUrl]);

    const localeText = {
        noRowsLabel: t("dataGrid.noRowsLabel"),
        noResultsOverlayLabel: t("dataGridnoResultsOverlayLabel"),
        columnHeaderSortIconLabel: t("dataGridcolumnHeaderSortIconLabel"),
        columnMenuSortAsc: t("dataGridcolumnMenuSortAsc"),
        columnMenuSortDesc: t("dataGridcolumnMenuSortDesc"),
        columnMenuUnsort: t("dataGridcolumnMenuUnsort"),
        columnMenuHideColumn: t("dataGridcolumnMenuHideColumn"),
        columnMenuManageColumns: t("dataGridcolumnMenuManageColumns"),
    };

    const columns: GridColDef[] = [
        {
            field: "samplingYear",
            headerName: t("SAMPLING_YEAR"),
            minWidth: 130,
            flex: 1,
            headerClassName: "header-style",
            align: "left",
            headerAlign: "left",
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
            field: "superCategorySampleOrigin",
            headerName: t("SUPER-CATEGORY-SAMPLE-ORIGIN"),
            minWidth: 180,
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
        // (No matrixGroup column in the table)
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
                        <Typography
                            variant="subtitle1"
                            style={{
                                marginBottom: "10px",
                                fontSize: "0.875rem",
                                color: theme.palette.text.secondary,
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
                                disableColumnFilter
                                hideFooter={false}
                                localeText={localeText}
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
                                    "& .MuiDataGrid-iconButtonContainer:hover":
                                        {
                                            backgroundColor:
                                                "rgba(0, 0, 0, 0.3)",
                                        },
                                    "& .MuiDataGrid-menuIconButton:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                                    },
                                    "& .MuiDataGrid-sortIcon:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                                    },
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
                                        backgroundColor: "#f0f0f0",
                                        color: "#000000",
                                        fontSize: "1rem",
                                    },
                                }}
                            />
                        </ThemeProvider>

                        {/* Download ZIP */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleDownloadClick}
                            disabled={prevalenceData.length === 0}
                            style={{
                                margin: "0.5em",
                                backgroundColor: theme.palette.primary.main,
                            }}
                        >
                            {t("DOWNLOAD_ZIP_FILE")}
                        </Button>

                        {/* ✅ Share link button UNDER the Download ZIP button */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleShareLink}
                            startIcon={<InsertLinkIcon />}
                            style={{
                                margin: "0 0.5em 0.5em 0.5em",
                                backgroundColor: theme.palette.primary.main,
                                textTransform: "none",
                                alignSelf: "center",
                            }}
                        >
                            {t("Share_Link")}
                        </Button>

                        {/* ✅ Copied message (optional) */}
                    </div>
                }
                defaultExpanded
                centerContent={false}
                withTopBorder={false}
            />

            <div style={{ height: "10px" }} />

            <ZNAccordion
                title={t("PREVALENCE_CHART")}
                content={
                    <div
                        style={{
                            maxHeight: isSmallScreen ? "1650px" : "950px",
                            width: "100%",
                            overflowY: "hidden",
                        }}
                    >
                        <div style={{ height: "100%", width: "100%" }}>
                            <PrevalenceChart />
                        </div>
                    </div>
                }
                defaultExpanded
                centerContent={false}
                withTopBorder={false}
            />
        </>
    );
};

export { PrevalenceDataGrid };
