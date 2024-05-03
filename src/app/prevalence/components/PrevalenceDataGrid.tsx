import React from "react";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line import/named
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { DataGridControls } from "./DataGridControls";
import { PrevalenceEntry } from "./PrevalenceDataContext";

interface PrevalenceDataGridProps {
    prevalenceData: PrevalenceEntry[];
    loading: boolean;
}

function downloadCSV(arrayOfData: PrevalenceEntry[], filename: string): void {
    // Added ': void'
    const csvRows = [];
    const headers = Object.keys(arrayOfData[0]) as (keyof PrevalenceEntry)[];
    csvRows.push(headers.join(","));

    for (const row of arrayOfData) {
        const values = headers.map((header) => {
            const value = row[header];
            const escaped = ("" + value).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
}
const PrevalenceDataGrid: React.FC<PrevalenceDataGridProps> = ({
    prevalenceData,
    loading,
}): JSX.Element => {
    const { t } = useTranslation(["PrevalencePage"]);

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

    const handleDownload = (): void => {
        downloadCSV(prevalenceData, "prevalence_data");
    };

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
                        <Button
                            onClick={handleDownload}
                            variant="contained"
                            color="primary"
                        >
                            {t("DOWNLOAD_TABLE")}
                        </Button>
                    </>
                ),
            }}
        />
    );
};

export { PrevalenceDataGrid };
