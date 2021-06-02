/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { CSVDownload } from "react-csv";
import { DialogComponent } from "../../../../Shared/Dialog.component";
import { ExportDialogCheckboxesComponent } from "./ExportDialog-Checkboxes.component";
import { errorColor } from "../../../../Shared/Style/Style-MainTheme.component";

const warningStyle = css`
    display: flex;
    color: ${errorColor};
    margin-left: 2em;
    font-size: 0.75rem;
`;

export function HeaderExportDialogComponent(props: {
    raw: boolean;
    stat: boolean;
    ZNFilename: string;
    dataString: string | undefined;
    buttonLabel: JSX.Element;
    loading: boolean;
    onClickClose: () => void;
    onClickExport: () => void;
    onCheckboxChange: (name: string, checked: boolean) => void;
    clearData: () => void;
}): JSX.Element {
    const { t } = useTranslation(["Export"]);
    const handleClose = (): void => props.onClickClose();
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    const handleExport = (): void => props.onClickExport();

    const handleClearData = (): void => props.clearData();

    const fileIsSelect = props.raw || props.stat;

    const exportDialogTitle = t("Content.Title");
    const exportContentText = t("Content.Text");
    const exportCheckboxes = (
        <div>
            <ExportDialogCheckboxesComponent
                onCheckboxChange={handleChangeCheckbox}
                isRaw={props.raw}
                isStat={props.stat}
            />
            {!fileIsSelect && <p css={warningStyle}>{t("Warning")}</p>}
        </div>
    );

    const exportCancelButton = t("Button.Cancel");

    const exportButtonLabel = props.buttonLabel;
    let exportSubmitButton: JSX.Element = exportButtonLabel;

    if (props.dataString !== undefined) {
        exportSubmitButton = (
            <div>
                {exportButtonLabel}
                <CSVDownload
                    data={props.dataString}
                    filename={props.ZNFilename}
                    target="_blank"
                />
            </div>
        );
        handleClearData()
    }

    return DialogComponent({
        loading: props.loading,
        dialogTitle: exportDialogTitle,
        dialogContentText: exportContentText,
        dialogContent: exportCheckboxes,
        cancelButton: exportCancelButton,
        submitButton: exportSubmitButton,
        disableSubmitButton: !fileIsSelect,
        onClose: handleClose,
        onSubmitClick: handleExport,
    });
}
