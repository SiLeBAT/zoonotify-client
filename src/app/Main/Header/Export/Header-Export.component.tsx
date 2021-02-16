import React, { useContext, useState } from "react";
import { Dialog } from "@material-ui/core";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { ExportInterface } from "../../../Shared/Model/Export.model";
import { HeaderExportButtonComponent } from "./Header-ExportButton.component";
import { ExportCheckboxesComponent } from "./Export-Checkboxes.component";
import { ExportTextContentComponent } from "./Export-TextContent.component";
import { ExportActionButtonsComponent } from "./Export-ActionButtons.component";
import {
    ExportLabels,
    generateExportLabels,
} from "../../../Core/ExportServices/generateExportLabels.service";
import { ExportButtonLabelComponent } from "./Export-ButtonLabel.component";

export function HeaderExportComponent(props: {
    settings: ExportInterface;
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element {
    const [open, setOpen] = useState(false);
    const { filter } = useContext(FilterContext);

    const handleClickOpen = (): void => {
        setOpen(true);
    };
    const handleClose = (): void => {
        setOpen(false);
    };

    const buttonLabel: JSX.Element = ExportButtonLabelComponent(open);
    const exportLabels: ExportLabels = generateExportLabels(filter.mainFilter);

    return (
        <div>
            <HeaderExportButtonComponent
                onClick={handleClickOpen}
                buttonLabel={buttonLabel}
            />
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <ExportTextContentComponent />
                <ExportCheckboxesComponent
                    onChange={props.handleChange}
                    raw={props.settings.raw}
                    stat={props.settings.stat}
                />
                <ExportActionButtonsComponent
                    onClick={handleClose}
                    setting={props.settings}
                    filter={filter.selectedFilter}
                    mainFilterAttributes={filter.mainFilter}
                    buttonLabel={buttonLabel}
                    ZNFilename={exportLabels.ZNFilename}
                    mainFilterLabels={exportLabels.mainFilterLabels}
                    allFilterLabel={exportLabels.allFilterLabel}
                />
            </Dialog>
        </div>
    );
}
