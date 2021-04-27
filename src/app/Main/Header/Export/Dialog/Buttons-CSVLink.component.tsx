/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";
import { dataAndStatisticToZipFile } from "../ExportServices/dataAndStatisticToZipFile.service";
import {
    ExportInterface,
    MainFilterLabels,
} from "../../../../Shared/Model/Export.model";
import { FilterInterface } from "../../../../Shared/Model/Filter.model";
import { dataOrStatisticToCsvString } from "../ExportServices/dataOrStatisticToCsvString.service";

const buttonLinkStyle = css`
    all: inherit !important;
`;

export interface ExportActionButtonProps {
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
export function ButtonsCsvLinkComponent(
    props: ExportActionButtonProps
): JSX.Element {
    const { t } = useTranslation(["Export"]);

    const subFileNames = [t("FileName.Stat"), t("FileName.DataSet")];
    const subFileName =
        props.setting.raw && !props.setting.stat
            ? subFileNames[1]
            : (!props.setting.raw && props.setting.stat
            ? subFileNames[0]
            : "");

    const handleClickZipExport = (): boolean => {
        if (props.setting.raw && props.setting.stat) {
            dataAndStatisticToZipFile({
                setting: props.setting,
                ZNFilename: props.ZNFilename,
                filter: props.filter,
                allFilterLabel: props.allFilterLabel,
                mainFilterLabels: props.mainFilterLabels,
                mainFilterAttributes: props.mainFilterAttributes,
                subFileNames,
            });
            return false;
        }
        return true;
    };

    return (
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
            onClick={handleClickZipExport}
            css={buttonLinkStyle}
        >
            {props.buttonLabel}
        </CSVLink>
    );
}
