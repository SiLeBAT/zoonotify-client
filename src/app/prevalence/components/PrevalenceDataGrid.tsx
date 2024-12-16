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

interface PrevalenceDataGridProps {
    prevalenceData: PrevalenceEntry[];
    loading: boolean;
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

const PrevalenceDataGrid: React.FC<PrevalenceDataGridProps> = ({
    prevalenceData,
    loading,
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

        const csvContentDot = createCSVContent(prevalenceData, ".");
        const csvContentComma = createCSVContent(prevalenceData, ",");

        zip.file(`prevalence_data_dot_${timestamp}.csv`, csvContentDot);
        zip.file(`prevalence_data_comma_${timestamp}.csv`, csvContentComma);

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

        zip.file(`search_parameters_${timestamp}.txt`, formattedText);

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
            align: "center",
        },
        {
            field: "microorganism",
            headerName: t("MICROORGANISM"),
            minWidth: 140,
            flex: 1,
            headerClassName: "header-style",
            align: "center",
            renderCell: (params) => formatMicroorganismName(params.value),
        },
        {
            field: "sampleOrigin",
            headerName: t("SAMPLE_ORIGIN"),
            minWidth: 140,
            flex: 1,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "samplingStage",
            headerName: t("SAMPLING_STAGE"),
            minWidth: 150,
            flex: 1,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "matrix",
            headerName: t("MATRIX"),
            minWidth: 120,
            flex: 1,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "numberOfSamples",
            headerName: t("NUMBER_OF_SAMPLES"),
            type: "number",
            minWidth: 170,
            flex: 1,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "numberOfPositive",
            headerName: t("NUMBER_OF_POSITIVE"),
            type: "number",
            minWidth: 150,
            flex: 1,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "percentageOfPositive",
            headerName: t("PERCENTAGE_OF_POSITIVE"),
            type: "number",
            valueGetter: (value: number) => `${value.toFixed(2)}`,
            minWidth: 150,
            flex: 1,
            headerClassName: "header-style",
            align: "center",
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
            align: "center",
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
            align: "center",
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

                        <DataGrid
                            rows={prevalenceData}
                            columns={columns}
                            loading={loading}
                            disableColumnFilter={true}
                            autoHeight={false}
                            hideFooter={false}
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
                                    color: theme.palette.primary.contrastText,
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
                                "& .MuiDataGrid-columnHeaderTitle": {
                                    whiteSpace: "normal !important",
                                    overflow: "visible !important",
                                },
                            }}
                        />
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
