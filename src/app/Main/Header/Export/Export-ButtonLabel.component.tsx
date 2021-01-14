/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useTranslation } from "react-i18next";
import { secondaryColor } from "../../../Shared/Style/Style-MainTheme.component";

const buttonLabelStyle = (open: boolean): SerializedStyles => css`
    display: flex;
    align-items: center;
    &:hover {
        color: ${open ? "none" : secondaryColor};
    }
`;

/**
 * @desc Returns the label and icon for the export button
 * @param {boolean} open - true if export dialog is open
 * @returns {JSX.Element} - label with icon for the export button component
 */
export function ExportButtonLabelComponent(
    open: boolean
): JSX.Element {
    const { t } = useTranslation(["Header"]);
    return (
        <div css={buttonLabelStyle(open)}>
            <GetAppIcon fontSize="small" />
            {t("Header:Export")}
        </div>
    );
}
