import React from "react";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line import/named
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DataGridControls } from "./DataGridControls";
import { PrevalenceEntry } from "./PrevalenceDataContext";

interface PrevalenceDataGridProps {
    prevalenceData: PrevalenceEntry[];
    loading: boolean;
}

const PrevalenceDataGrid: React.FC<PrevalenceDataGridProps> = ({
    prevalenceData,
    loading,
}) => {
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

    return (
        <DataGrid
            rows={prevalenceData}
            columns={columns}
            loading={loading}
            autoHeight={false}
            disableColumnFilter={true}
            hideFooter={true}
            // Set the height to enable scrolling within the grid
            style={{ height: 1000, width: "100%", overflowX: "auto" }}
            slots={{
                toolbar: () => (
                    <DataGridControls
                        heading={t("TABLE_DETAIL")}
                    ></DataGridControls>
                ),
            }}
        />
    );
};

export { PrevalenceDataGrid };
