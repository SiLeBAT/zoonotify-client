/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { DialogComponent } from "../../../../Shared/Dialog.component";
import { FilterContextInterface } from "../../../../Shared/Context/FilterContext";
import { ExportInterface } from "../../../../Shared/Model/Export.model";
import { ExportDialogCheckboxesComponent } from "./ExportDialog-Checkboxes.component";
import { ExportLabels } from "../ExportServices/generateExportLabels.service";
import { ButtonsCsvLinkComponent } from "./Buttons-CSVLink.component";
import { errorColor } from "../../../../Shared/Style/Style-MainTheme.component";

const warningStyle = css`
    display: flex;
    color: ${errorColor};
    margin-left: 2em;
    font-size: 0.75rem;
`;

export function HeaderExportDialogComponent(props: {
    settings: ExportInterface;
    exportLabels: ExportLabels;
    buttonLabel: JSX.Element;
    filter: FilterContextInterface;
    onClickClose: () => void;
    onClickExport: () => void;
    onCheckboxChange: (name: string, checked: boolean) => void;
}): JSX.Element {
    const { t } = useTranslation(["Export"]);
    const handleClose = (): void => props.onClickClose();
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    const handleExport = (): void => props.onClickExport();

    const fileIsSelect = props.settings.raw || props.settings.stat;

    const exportDialogTitle = t("Content.Title");
    const exportContentText = t("Content.Text");
    const exportCheckboxes = (
        <div>
            <ExportDialogCheckboxesComponent
                onCheckboxChange={handleChangeCheckbox}
                isRaw={props.settings.raw}
                isStat={props.settings.stat}
            />
            {!fileIsSelect && <p css={warningStyle}>{t("Warning")}</p>}
        </div>
    );

    const exportCancelButton = t("Button.Cancel");

    const exportSubmitButton = (
        <ButtonsCsvLinkComponent
            setting={props.settings}
            filter={props.filter.selectedFilter}
            mainFilterAttributes={props.filter.mainFilter}
            buttonLabel={props.buttonLabel}
            ZNFilename={props.exportLabels.ZNFilename}
            mainFilterLabels={props.exportLabels.mainFilterLabels}
            allFilterLabel={props.exportLabels.allFilterLabel}
        />
    );

    return DialogComponent({
        isOpen: true,
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
