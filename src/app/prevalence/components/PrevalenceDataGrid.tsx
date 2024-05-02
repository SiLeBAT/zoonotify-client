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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            valueGetter: (params: any) => {
                const ciMin = params.value;
                return ciMin != null ? ciMin.toFixed(2) : ""; // Handle null
            },
        },
        {
            field: "ciMax",
            headerName: t("CIMAX"),
            type: "number",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            valueGetter: (params: any) => {
                const ciMin = params.value;
                return ciMin != null ? ciMin.toFixed(2) : ""; // Handle null
            },
        },
    ];

    return (
        <DataGrid
            rows={prevalenceData}
            columns={columns}
            hideFooter={true}
            autoHeight={true}
            autosizeOnMount={true}
            disableColumnFilter={true}
            loading={loading}
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
