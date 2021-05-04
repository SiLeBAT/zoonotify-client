import React from "react";
import { useTranslation } from "react-i18next";
import { DialogComponent } from "../../../../Shared/Dialog.component";
import { FilterContextInterface } from "../../../../Shared/Context/FilterContext";
import { ExportInterface } from "../../../../Shared/Model/Export.model";
import { ExportDialogCheckboxesComponent } from "./ExportDialog-Checkboxes.component";
import { ExportLabels } from "../ExportServices/generateExportLabels.service";
import { ExportDialogWarningComponent } from "./ExportDialog-Warning.component";
import { ButtonsCsvLinkComponent } from "./Buttons-CSVLink.component";

export function HeaderExportDialogComponent(props: {
    isOpen: boolean;
    settings: ExportInterface;
    exportLabels: ExportLabels;
    buttonLabel: JSX.Element;
    filter: FilterContextInterface;
    onClickClose: () => void;
    onCheckboxChange: (name: string, checked: boolean) => void;
}): JSX.Element {
    const { t } = useTranslation(["Export"]);
    const handleClose = (): void => props.onClickClose();
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

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
            <ExportDialogWarningComponent fileIsSelect={fileIsSelect} />
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
        isOpen: props.isOpen,
        dialogTitle: exportDialogTitle,
        dialogContentText: exportContentText,
        dialogContent: exportCheckboxes,
        cancelButton: exportCancelButton,
        submitButton: exportSubmitButton,
        disableSubmitButton: !fileIsSelect,
        onClose: handleClose,
        onCancelClick: handleClose,
        onSubmitClick: handleClose,
    });
}
