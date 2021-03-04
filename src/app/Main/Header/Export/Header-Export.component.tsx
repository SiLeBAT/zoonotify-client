import React, { useContext } from "react";
import { Dialog } from "@material-ui/core";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { ExportInterface } from "../../../Shared/Model/Export.model";
import { HeaderExportButtonComponent } from "./Header-ExportButton.component";
import { ExportCheckboxesComponent } from "./Export-Checkboxes.component";
import { ExportTextContentComponent } from "./Export-TextContent.component";
import { ExportActionButtonsComponent } from "./Export-ActionButtons.component";
import { ExportLabels } from "../../../Core/ExportServices/generateExportLabels.service";

export function HeaderExportComponent(props: {
    isOpen: boolean;
    settings: ExportInterface;
    buttonLabel: JSX.Element;
    exportLabels: ExportLabels;
    handleClickOpen: () => void;
    handleClickClose: () => void;
    handleCheckbox: (name: string, checked: boolean) => void;
}): JSX.Element {
    const { filter } = useContext(FilterContext);

    return (
        <div>
            <HeaderExportButtonComponent
                handleClickOpen={props.handleClickOpen}
                buttonLabel={props.buttonLabel}
            />
            <Dialog
                open={props.isOpen}
                onClose={props.handleClickClose}
                aria-labelledby="form-dialog-title"
            >
                <ExportTextContentComponent />
                <ExportCheckboxesComponent
                    handleCheckbox={props.handleCheckbox}
                    raw={props.settings.raw}
                    stat={props.settings.stat}
                />
                <ExportActionButtonsComponent
                    handleClickClose={props.handleClickClose}
                    setting={props.settings}
                    filter={filter.selectedFilter}
                    mainFilterAttributes={filter.mainFilter}
                    buttonLabel={props.buttonLabel}
                    ZNFilename={props.exportLabels.ZNFilename}
                    mainFilterLabels={props.exportLabels.mainFilterLabels}
                    allFilterLabel={props.exportLabels.allFilterLabel}
                />
            </Dialog>
        </div>
    );
}
