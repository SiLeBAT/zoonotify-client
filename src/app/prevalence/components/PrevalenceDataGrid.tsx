import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line import/named
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Link } from "@mui/material";
import { useTheme } from "@mui/system";
import { DataGridControls } from "./DataGridControls";
import { PrevalenceEntry } from "./PrevalenceDataContext";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
interface PrevalenceDataGridProps {
    prevalenceData: PrevalenceEntry[];
    loading: boolean;
}

const PrevalenceDataGrid: React.FC<PrevalenceDataGridProps> = ({
    prevalenceData,
    loading,
}) => {
    const { t } = useTranslation(["PrevalencePage"]);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [filename, setFilename] = useState<string>("");
    const theme = useTheme();

    const getFormattedTimestamp = (): string => {
        const date = new Date();
        return date.toISOString().replace(/[:.]/g, "-");
    };

    const prepareDownload = (): void => {
        if (prevalenceData.length === 0) return;

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
        csvRows.push(
            "\uFEFF" +
                headers.map((header) => t(header.toUpperCase())).join(",")
        );

        for (const row of prevalenceData) {
            const values = headers.map((header) => {
                const value = row[header];
                const escaped =
                    typeof value === "string"
                        ? `"${value.replace(/"/g, '""')}"`
                        : value;
                return `${escaped}`;
            });
            csvRows.push(values.join(","));
        }
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
        setFilename(`prevalence_data_${getFormattedTimestamp()}.csv`);
    };

    useEffect(() => {
        if (prevalenceData.length > 0) {
            prepareDownload();
        }
    }, [prevalenceData]);

    const columns: GridColDef[] = [
        {
            field: "samplingYear",
            headerName: t("SAMPLING_YEAR"),
            width: 150,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "microorganism",
            headerName: t("MICROORGANISM"),
            width: 150,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "sampleOrigin",
            headerName: t("SAMPLE_ORIGIN"),
            width: 150,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "samplingStage",
            headerName: t("SAMPLING_STAGE"),
            width: 150,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "matrix",
            headerName: t("MATRIX"),
            width: 120,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "numberOfSamples",
            headerName: t("NUMBER_OF_SAMPLES"),
            type: "number",
            width: 200,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "numberOfPositive",
            headerName: t("NUMBER_OF_POSITIVE"),
            type: "number",
            width: 200,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "percentageOfPositive",
            headerName: t("PERCENTAGE_OF_POSITIVE"),
            type: "number",
            valueGetter: (value: number) => `${value.toFixed(2)}%`,
            width: 180,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "ciMin",
            headerName: t("CIMIN"),
            type: "number",
            valueGetter: (value: number) =>
                value != null ? value.toFixed(2) : "N/A",
            width: 100,
            headerClassName: "header-style",
            align: "center",
        },
        {
            field: "ciMax",
            headerName: t("CIMAX"),
            type: "number",
            valueGetter: (value: number) =>
                value != null ? value.toFixed(2) : "N/A",
            width: 100,
            headerClassName: "header-style",
            align: "center",
        },
    ];

    return (
        <>
            <div style={{ marginBottom: "20px" }}>
                {" "}
                {/* Added margin for spacing */}
                <DataGridControls heading={t("TABLE_DETAIL")} />
            </div>
            <ZNAccordion
                title={t("PREVALENCE_TABLE")}
                content={
                    <div
                        style={{
                            height: 700,
                            width: "100%",
                            overflowX: "auto",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <DataGrid
                            rows={prevalenceData}
                            columns={columns}
                            loading={loading}
                            disableColumnFilter={true}
                            autoHeight={false}
                            hideFooter={false}
                            sx={{
                                border: 2,
                                borderColor: "primary.main",
                                "& .header-style": {
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    textAlign: "center",
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
                            }}
                        />
                        {downloadUrl && (
                            <Button
                                variant="contained"
                                color="primary"
                                style={{
                                    margin: "0.5em",
                                    padding: "0em",
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
                                    {t("DOWNLOAD_TABLE")}
                                </Link>
                            </Button>
                        )}
                    </div>
                }
                defaultExpanded={true}
                centerContent={false}
            />
        </>
    );
};

export { PrevalenceDataGrid };
