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

    // Function to get a formatted timestamp for the filename
    const getFormattedTimestamp = (): string => {
        const date = new Date();
        return date.toISOString().replace(/[:.]/g, "-");
    };

    // Function to prepare the download
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
        const blob = new Blob([csvString], { type: "text/csv" });
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
        { field: "samplingYear", headerName: t("SAMPLING_YEAR"), width: 150 },
        { field: "microorganism", headerName: t("MICROORGANISM"), width: 200 },
        { field: "sampleOrigin", headerName: t("SAMPLE_ORIGIN"), width: 200 },
        { field: "samplingStage", headerName: t("SAMPLING_STAGE"), width: 200 },
        { field: "matrix", headerName: t("MATRIX"), width: 200 },
        {
            field: "numberOfSamples",
            headerName: t("NUMBER_OF_SAMPLES"),
            type: "number",
            width: 180,
        },
        {
            field: "numberOfPositive",
            headerName: t("NUMBER_OF_POSITIVE"),
            type: "number",
            width: 180,
        },
        {
            field: "percentageOfPositive",
            headerName: t("PERCENTAGE_OF_POSITIVE"),
            type: "number",
            valueGetter: (value: number) => `${value.toFixed(2)}%`,
            width: 180,
        },
        {
            field: "ciMin",
            headerName: t("CIMIN"),
            type: "number",
            valueGetter: (value: number) =>
                value != null ? value.toFixed(2) : "N/A",
            width: 150,
        },
        {
            field: "ciMax",
            headerName: t("CIMAX"),
            type: "number",
            valueGetter: (value: number) =>
                value != null ? value.toFixed(2) : "N/A",
            width: 150,
        },
    ];

    return (
        <div
            style={{
                height: 1000,
                width: "100%",
                overflowX: "auto",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <DataGridControls heading={t("TABLE_DETAIL")} />
            <DataGrid
                rows={prevalenceData}
                columns={columns}
                loading={loading}
                disableColumnFilter={false}
                autoHeight={false}
                hideFooter={false}
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
    );
};

export { PrevalenceDataGrid };
