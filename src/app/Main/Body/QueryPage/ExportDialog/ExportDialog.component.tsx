/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import {
    DialogButton,
    DialogComponent,
} from "../../../../Shared/Dialog.component";
import { ExportDialogCheckboxesComponent } from "./ExportDialog-Checkboxes.component";
import { errorColor } from "../../../../Shared/Style/Style-MainTheme";

const warningStyle = css`
    display: flex;
    color: ${errorColor};
    margin-left: 2em;
    font-size: 0.75rem;
`;

export function ExportDialogComponent(props: {
    exportOptions: {
        raw: boolean;
        stat: boolean;
        chart: boolean;
    };
    loading: boolean;
    nrOfIsolates: number;
    onClickClose: () => void;
    onClickExport: () => Promise<void>;
    onCheckboxChange: (name: string, checked: boolean) => void;
}): JSX.Element {
    const { t } = useTranslation(["Export"]);
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
    const exportCheckboxes = (
        <div>
            <ExportDialogCheckboxesComponent
                onCheckboxChange={handleChangeCheckbox}
                isRaw={exportRawTable}
                isStat={exportStatTable}
                isChart={exportChart}
                nrOfIsolates={props.nrOfIsolates}
            />
            {noExportOptionSelected && <p css={warningStyle}>{t("Warning")}</p>}
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
