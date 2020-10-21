/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useTranslation } from "react-i18next";
import { secondaryColor } from "../../../Shared/Style/Style-MainTheme.component";
import { getFormattedDate } from "../../../Core/getCurrentDate.service";
import { MainFilterLabelInterface } from "../../../Shared/Export.model";
import { mainFilterAttributes } from "../../../Shared/Filter.model";

const buttonLableStyle = (open: boolean): SerializedStyles => css`
    display: flex;
    align-items: center;
    &:hover {
        color: ${open ? "none" : secondaryColor};
    }
`;

export function generateExportLabels(
    open: boolean
): [JSX.Element, string, MainFilterLabelInterface, string] {
    const { t } = useTranslation(["Header", "QueryPage"]);

    const buttonLabel = (
        <div css={buttonLableStyle(open)}>
            <GetAppIcon fontSize="small" />
            {t("Header:Export")}
        </div>
    );
    const ZNFilename = `ZooNotify_${getFormattedDate()}.csv`;

    const mainFilterLabels = {} as MainFilterLabelInterface

    mainFilterAttributes.forEach(mainFilter => {
        mainFilterLabels[mainFilter] =  t(`QueryPage:Filters.${mainFilter}`)
    });

    const allFilterLabel: string = t("QueryPage:Filters.All");

    return [buttonLabel, ZNFilename, mainFilterLabels, allFilterLabel];
}
