/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";
import { Button, DialogActions } from "@material-ui/core";
import { objectToCSV } from "../../../Core/ExportServices/objectToCSV.service";
import { objectToZIP } from "../../../Core/ExportServices/objectsToZIP.service";
import {
    ExportInterface,
    MainFilterLabelInterface,
} from "../../../Shared/Model/Export.model";
import { FilterInterface } from "../../../Shared/Model/Filter.model";
import { errorColor } from "../../../Shared/Style/Style-MainTheme.component";

const buttonLinkStyle = css`
    all: inherit !important;
`;

const warningStyle = (isSelect: boolean): SerializedStyles => css`
    display: ${isSelect ? "none" : "flex"};
    color: ${errorColor};
    margin-left: 2em;
    font-size: 0.75rem;
`;

interface ExportActionButtonProps {
    onClick: (event: unknown) => void;
    setting: ExportInterface;
    filter: FilterInterface;
    buttonLabel: JSX.Element;
    ZNFilename: string;
    mainFilterLabels: MainFilterLabelInterface;
    allFilterLabel: string;
}

/**
 * @desc Returns action buttons for the export dialog
 * @param {(event: unknown) => void} onClick - onClick function to close the export dialog
 * @param {ExportInterface} setting -  all info for export (raw/stat, row&column, dataset)
 * @param {FilterInterface} filter - object with the selected filters
 * @param {JSX.Element} buttonLabel - component for the export button label
 * @param {string} ZNFilename - main filename 
 * @param {MainFilterLabelInterface} mainFilterLabels -  object with labels of the main filters 
 * @param {string} allFilterLabel - "all values" / "Alle Werte"
 * @returns {JSX.Element} - action buttons component
 */
export function ExportActionButtonsComponent(
    props: ExportActionButtonProps
): JSX.Element {
    const { t } = useTranslation(["Export"]);

    const handleClose = (event: unknown): void => {
        props.onClick(event);
    };

    const fileIsSelect = !(!props.setting.raw && !props.setting.stat);
    const subFileNames = [t("FileName.Stat"), t("FileName.DataSet")];
    const subFileName =
        props.setting.raw && !props.setting.stat
            ? subFileNames[1]
            : (!props.setting.raw && props.setting.stat
            ? subFileNames[0]
            : "");

    return (
        <div>
            <p css={warningStyle(fileIsSelect)}>{t("Warning")}</p>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    {t("Button.Cancel")}
                </Button>
                <Button onClick={handleClose} color="primary" disabled={!fileIsSelect}>
                    <CSVLink
                        data={objectToCSV({
                            setting: props.setting,
                            filter: props.filter,
                            allFilterLabel: props.allFilterLabel,
                            mainFilterLabels: props.mainFilterLabels,
                        })}
                        filename={`${subFileName}_${props.ZNFilename}`}
                        target="_blank"
                        onClick={() => {
                            if (props.setting.raw && props.setting.stat) {
                                objectToZIP({
                                    setting: props.setting,
                                    ZNFilename: props.ZNFilename,
                                    filter: props.filter,
                                    allFilterLabel: props.allFilterLabel,
                                    mainFilterLabels: props.mainFilterLabels,
                                    subFileNames,
                                });
                                return false;
                            }
                            return true;
                        }}
                        css={buttonLinkStyle}
                    >
                        {props.buttonLabel}
                    </CSVLink>
                </Button>
            </DialogActions>
        </div>
    );
}
