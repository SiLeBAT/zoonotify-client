/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useTranslation } from "react-i18next";
import { secondaryColor } from "../../../Shared/Style/Style-MainTheme.component";
import { getCurrentDate } from "../../../Core/getCurrentDate.service";
import { MainFilterLabelInterface } from "../../../Shared/Model/Export.model";
import { mainFilterAttributes } from "../../../Shared/Model/Filter.model";

const buttonLabelStyle = (open: boolean): SerializedStyles => css`
    display: flex;
    align-items: center;
    &:hover {
        color: ${open ? "none" : secondaryColor};
    }
`;

/**
 * @desc Returns all labels for the file export in the right language
 * @param {boolean} open - true if export dialog is open
 * @returns {[JSX.Element, string, MainFilterLabelInterface, string]} - list of labels: for the export button, for the file, of the main filters, for "all values"
 */
export function ExportGenerateLabelsComponent(
    open: boolean
): [JSX.Element, string, MainFilterLabelInterface, string] {
    const { t } = useTranslation(["Header", "QueryPage"]);

    const buttonLabel = (
        <div css={buttonLabelStyle(open)}>
            <GetAppIcon fontSize="small" />
            {t("Header:Export")}
        </div>
    );
    const ZNFilename = `ZooNotify_${getCurrentDate()}.csv`;

    const mainFilterLabels = {} as MainFilterLabelInterface
    mainFilterAttributes.forEach(mainFilter => {
        mainFilterLabels[mainFilter] =  t(`QueryPage:Filters.${mainFilter}`)
    });

    const allFilterLabel: string = t("QueryPage:Filters.All");

    return [buttonLabel, ZNFilename, mainFilterLabels, allFilterLabel];
}
