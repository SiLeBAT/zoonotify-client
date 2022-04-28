import React from "react";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import {
    DialogButton,
    DialogComponent,
} from "../../../../Shared/Dialog.component";
import { ExportDialogCheckboxesComponent } from "./ExportDialog-Checkboxes.component";

export function ExportDialogComponent(props: {
    exportOptions: {
        raw: boolean;
        stat: boolean;
        chart: boolean;
    };
    noTableFeatures: boolean;
    loading: boolean;
    nrOfIsolates: number;
    onClickClose: () => void;
    onClickExport: () => Promise<void>;
    onCheckboxChange: (name: string, checked: boolean) => void;
}): JSX.Element {
    const { t } = useTranslation(["Export"]);
    const theme = useTheme();
    const handleClose = (): void => props.onClickClose();
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    const handleExport = (): Promise<void> => props.onClickExport();

    const exportStatTable = props.exportOptions.stat;
    const exportRawTable = props.exportOptions.raw;
    const exportChart = props.exportOptions.chart;
    const exportOptionIsSelected =
        exportRawTable || exportStatTable || exportChart;
    const noExportOptionSelected = !exportOptionIsSelected;

    const exportDialogTitle = t("Content.Title");
    const exportContentText = t("Content.Text");

    let warningText = t("Warning.noOptions");
    if (props.noTableFeatures) {
        warningText = t("Warning.noFeatures");
    }
    const showWarning = noExportOptionSelected || props.noTableFeatures;
    const exportCheckboxes = (
        <div>
            <ExportDialogCheckboxesComponent
                onCheckboxChange={handleChangeCheckbox}
                isRaw={exportRawTable}
                isStat={exportStatTable}
                isChart={exportChart}
                statAndChartExportIsDisabled={props.noTableFeatures}
                nrOfIsolates={props.nrOfIsolates}
            />
            {showWarning && (
                <Typography
                    component="p"
                    sx={{
                        color: theme.palette.error.main,
                        fontSize: "0.75rem",
                    }}
                >
                    {warningText}
                </Typography>
            )}
        </div>
    );

    const exportButton: DialogButton = {
        content: t("Button.Submit"),
        disabled: !exportOptionIsSelected,
        onClick: handleExport,
    };

    const exportCancelButton: DialogButton = {
        content: t("Button.Cancel"),
        onClick: handleClose,
    };

    return DialogComponent({
        loading: props.loading,
        dialogTitle: exportDialogTitle,
        dialogContentText: exportContentText,
        dialogContent: exportCheckboxes,
        cancelButton: exportCancelButton,
        submitButton: exportButton,
    });
}
