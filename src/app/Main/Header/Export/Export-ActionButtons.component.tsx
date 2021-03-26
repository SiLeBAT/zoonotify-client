/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";
import { Button, DialogActions } from "@material-ui/core";
import { dataOrStatisticToCsvString } from "../../../Core/ExportServices/dataOrStatisticToCsvString.service";
import { dataAndStatisticToZipFile } from "../../../Core/ExportServices/dataAndStatisticToZipFile.service";
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
    mainFilterLabels: MainFilterLabelInterface;
    /**
     * "all values" / "Alle Werte"
     */
    allFilterLabel: string;
}

/**
 * @desc Returns action buttons for the export dialog
 * @param {ExportActionButtonProps} props
 * @returns {JSX.Element} - action buttons component
 */
export function ExportActionButtonsComponent(
    props: ExportActionButtonProps
): JSX.Element {
    const { t } = useTranslation(["Export"]);

    const handleClick = (): void => props.onClickClose();

    const fileIsSelect = props.setting.raw || props.setting.stat;
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
                <Button onClick={handleClick} color="primary">
                    {t("Button.Cancel")}
                </Button>
                <Button
                    onClick={handleClick}
                    color="primary"
                    disabled={!fileIsSelect}
                >
                    <CSVLink
                        data={dataOrStatisticToCsvString({
                            setting: props.setting,
                            filter: props.filter,
                            allFilterLabel: props.allFilterLabel,
                            mainFilterLabels: props.mainFilterLabels,
                            mainFilterAttributes: props.mainFilterAttributes,
                        })}
                        filename={`${subFileName}_${props.ZNFilename}`}
                        target="_blank"
                        onClick={() => {
                            if (props.setting.raw && props.setting.stat) {
                                dataAndStatisticToZipFile({
                                    setting: props.setting,
                                    ZNFilename: props.ZNFilename,
                                    filter: props.filter,
                                    allFilterLabel: props.allFilterLabel,
                                    mainFilterLabels: props.mainFilterLabels,
                                    subFileNames,
                                    mainFilterAttributes:
                                        props.mainFilterAttributes,
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
