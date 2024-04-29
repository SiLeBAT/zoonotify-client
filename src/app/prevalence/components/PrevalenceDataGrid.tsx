// eslint-disable-next-line import/named
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";
import { useTranslation } from "react-i18next";
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
        { field: "microorganism", headerName: t("MICROORGANISM") },
        { field: "samplingYear", headerName: t("SAMPLING_YEAR") },
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
            valueGetter: (value: number) => `${value.toFixed(2)}`,
        },
        {
            field: "ciMax",
            headerName: t("CIMAX"),
            type: "number",
            valueGetter: (value: number) => `${value.toFixed(2)}`,
        },
        { field: "matrix", headerName: t("MATRIX") },
        { field: "matrixDetail", headerName: t("MATRIX_DETAIL") },
        { field: "matrixGroup", headerName: t("MATRIX_GROUP") },
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
