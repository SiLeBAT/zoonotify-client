import React, { useContext } from "react";
import { Dialog } from "@material-ui/core";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { ExportInterface } from "../../../Shared/Model/Export.model";
import { HeaderExportButtonComponent } from "./Header-ExportButton.component";
import { ExportCheckboxesComponent } from "./Export-Checkboxes.component";
import { ExportTextContentComponent } from "./Export-TextContent.component";
import { ExportActionButtonsComponent } from "./Export-ActionButtons.component";
import { ExportLabels } from "../../../Core/ExportServices/generateExportLabels.service";
import { ExportButtonLabelComponent } from "./Export-ButtonLabel.component";

export function HeaderExportComponent(props: {
    isOpen: boolean;
    settings: ExportInterface;
    exportLabels: ExportLabels;
    onClickOpen: () => void;
    onClickClose: () => void;
    onCheckboxChange: (name: string, checked: boolean) => void;
}): JSX.Element {
    const { filter } = useContext(FilterContext);

    const handleClickOpen = (): void => props.onClickOpen();
    const handleClickClose = (): void => props.onClickClose();
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    const buttonLabel: JSX.Element = ExportButtonLabelComponent(props.isOpen);

    return (
        <div>
            <HeaderExportButtonComponent
                onClickOpen={handleClickOpen}
                buttonLabel={buttonLabel}
            />
            <Dialog
                open={props.isOpen}
                onClose={handleClickClose}
                aria-labelledby="form-dialog-title"
            >
                <ExportTextContentComponent />
                <ExportCheckboxesComponent
                    onCheckboxChange={handleChangeCheckbox}
                    raw={props.settings.raw}
                    stat={props.settings.stat}
                />
                <ExportActionButtonsComponent
                    onClickClose={handleClickClose}
                    setting={props.settings}
                    filter={filter.selectedFilter}
                    mainFilterAttributes={filter.mainFilter}
                    buttonLabel={buttonLabel}
                    ZNFilename={props.exportLabels.ZNFilename}
                    mainFilterLabels={props.exportLabels.mainFilterLabels}
                    allFilterLabel={props.exportLabels.allFilterLabel}
                />
            </Dialog>
        </div>
    );
}
