import React from "react";
import { DialogContentText } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { DialogComponent } from "../../../Shared/Dialog.component";
import { FilterContextInterface } from "../../../Shared/Context/FilterContext";
import { ExportInterface } from "../../../Shared/Model/Export.model";
import { HeaderExportButtonComponent } from "./Header-ExportButton.component";
import { ExportDialogCheckboxesComponent } from "./Dialog/ExportDialog-Checkboxes.component";
import { ExportDialogButtonsComponent } from "./Dialog/ExportDialog-Buttons.component";
import { ExportButtonLabelComponent } from "./Export-ButtonLabel.component";
import { ExportLabels } from "./ExportServices/generateExportLabels.service";
import { ExportDialogWarningComponent } from "./Dialog/ExportDialog-Warning.component";

export function HeaderExportDialogComponent(props: {
    isOpen: boolean;
    settings: ExportInterface;
    exportLabels: ExportLabels;
    filter: FilterContextInterface;
    onClickOpen: () => void;
    onClickClose: () => void;
    onCheckboxChange: (name: string, checked: boolean) => void;
}): JSX.Element {
    const { t } = useTranslation(["Export"]);
    const handleClickOpen = (): void => props.onClickOpen();
    const handleClickClose = (): void => props.onClickClose();
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    const fileIsSelect = props.settings.raw || props.settings.stat;

    const buttonLabel: JSX.Element = ExportButtonLabelComponent(props.isOpen);

    const exportDialogTitle = t("Content.Title");
    const exportContentText = (
        <DialogContentText>{t("Content.Text")}</DialogContentText>
    );
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

    const exportButtons = (
        <ExportDialogButtonsComponent
            onClickClose={handleClickClose}
            setting={props.settings}
            filter={props.filter.selectedFilter}
            mainFilterAttributes={props.filter.mainFilter}
            buttonLabel={buttonLabel}
            ZNFilename={props.exportLabels.ZNFilename}
            mainFilterLabels={props.exportLabels.mainFilterLabels}
            allFilterLabel={props.exportLabels.allFilterLabel}
        />
    );

    return (
        <div>
            <HeaderExportButtonComponent
                onClickOpen={handleClickOpen}
                buttonLabel={buttonLabel}
            />
            {DialogComponent({
                isOpen: props.isOpen,
                dialogTitle: exportDialogTitle,
                dialogContentText: exportContentText,
                dialogContent: exportCheckboxes,
                dialogButtons: exportButtons,
                onClickClose: handleClickClose,
            })}
        </div>
    );
}
