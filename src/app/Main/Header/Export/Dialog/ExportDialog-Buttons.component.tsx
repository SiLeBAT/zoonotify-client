import React from "react";
import { useTranslation } from "react-i18next";
import { Button, DialogActions } from "@material-ui/core";
import {
    ExportInterface,
    MainFilterLabels,
} from "../../../../Shared/Model/Export.model";
import { FilterInterface } from "../../../../Shared/Model/Filter.model";
import { ButtonsCsvLinkComponent } from "./Buttons-CSVLink.component";

export interface ExportActionButtonProps {
    onClickClose: () => void;
    /**
     * all info for export (raw/stat, row&column, dataset)
     */
    setting: ExportInterface;
    /**
     * object with the selected filters
     */
    filter: FilterInterface;
    /**
     * list of main filters
     */
    mainFilterAttributes: string[];
    /**
     * component for the export button label
     */
    buttonLabel: JSX.Element;
    /**
     * main filename
     */
    ZNFilename: string;
    /**
     * object with labels of the main filters
     */
    mainFilterLabels: MainFilterLabels;
    /**
     * "all values" / "Alle Werte"
     */
    allFilterLabel: string;
}

/**
 * @desc Returns action buttons for the export dialog
 * @param props
 * @returns {JSX.Element} - action buttons component
 */
export function ExportDialogButtonsComponent(
    props: ExportActionButtonProps
): JSX.Element {
    const { t } = useTranslation(["Export"]);

    const handleClick = (): void => props.onClickClose();

    const fileIsSelect = props.setting.raw || props.setting.stat;
    return (
        <DialogActions>
            <Button onClick={handleClick} color="primary">
                {t("Button.Cancel")}
            </Button>
            <Button
                onClick={handleClick}
                color="primary"
                disabled={!fileIsSelect}
            >
                <ButtonsCsvLinkComponent
                    setting={props.setting}
                    filter={props.filter}
                    mainFilterAttributes={props.mainFilterAttributes}
                    buttonLabel={props.buttonLabel}
                    ZNFilename={props.ZNFilename}
                    mainFilterLabels={props.mainFilterLabels}
                    allFilterLabel={props.allFilterLabel}
                />
            </Button>
        </DialogActions>
    );
}
