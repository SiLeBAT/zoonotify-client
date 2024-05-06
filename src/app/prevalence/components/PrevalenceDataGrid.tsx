import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line import/named
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Link } from "@mui/material";
import { DataGridControls } from "./DataGridControls";
import { PrevalenceEntry } from "./PrevalenceDataContext";
import { useTheme } from "@mui/system";

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

    const prepareDownload = (): void => {
        if (prevalenceData.length === 0) return;

        const csvRows = [];
        const headers = Object.keys(prevalenceData[0]) as Array<
            keyof PrevalenceEntry
        >;
        csvRows.push(headers.join(","));

        for (const row of prevalenceData) {
            const values = headers.map((header) => {
                const value = row[header];
                const escaped =
                    typeof value === "string"
                        ? '"' + value.replace(/"/g, '""') + '"'
                        : value;
                return `${escaped}`;
            });
            csvRows.push(values.join(","));
        }
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
        setFilename("prevalence_data.csv");
    };

    useEffect(() => {
        if (prevalenceData.length > 0) {
            prepareDownload();
        }
    }, [prevalenceData]);

    const columns: GridColDef[] = [
        { field: "samplingYear", headerName: t("SAMPLING_YEAR") },
        { field: "microorganism", headerName: t("MICROORGANISM") },
        { field: "sampleOrigin", headerName: t("SAMPLE_ORIGIN") },
        { field: "samplingStage", headerName: t("SAMPLING_STAGE") },
        { field: "matrix", headerName: t("MATRIX") },

        {
            field: "numberOfSamples",
            headerName: t("NUMBER_OF_SAMPLES"),
            type: "number",
        },
        {
            field: "numberOfPositive",
            headerName: t("NUMBER_OF_POSITIVE"),
            type: "number",
        },
        {
            field: "percentageOfPositive",
            headerName: t("PERCENTAGE_OF_POSITIVE"),
            valueGetter: (value: number) => `${value.toFixed(2)}%`,
        },
        {
            field: "ciMin",
            headerName: t("CIMIN"),
            type: "number",
            valueGetter: (value: number) =>
                value != null ? value.toFixed(2) : "N/A",
        },
        {
            field: "ciMax",
            headerName: t("CIMAX"),
            type: "number",
            valueGetter: (value: number) =>
                value != null ? value.toFixed(2) : "N/A",
        },
    ];

    return (
        <DataGrid
            rows={prevalenceData}
            columns={columns}
            loading={loading}
            autoHeight={false}
            disableColumnFilter={true}
            hideFooter={true}
            style={{ height: 1000, width: "100%", overflowX: "auto" }}
            slots={{
                toolbar: () => (
                    <>
                        <DataGridControls heading={t("TABLE_DETAIL")} />
                        {downloadUrl && (
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                    margin: "0.5em",
                                    padding: "0em",
                                    backgroundColor: theme.palette.primary.main,
                                }}
                            >
                                <Link
                                    href={downloadUrl}
                                    download={filename}
                                    sx={{
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
                    </>
                ),
            }}
        />
    );
};

export { PrevalenceDataGrid };
