/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import GetAppIcon from "@mui/icons-material/GetApp";
import { useTranslation } from "react-i18next";
import { secondaryColor } from "./Style/Style-MainTheme.component";

const buttonLabelStyle = (isOpen: boolean): SerializedStyles => css`
    display: flex;
    align-items: center;
    &:hover {
        color: ${isOpen ? "none" : secondaryColor};
    }
`;

/**
 * @desc Returns the label and icon for the export button
 * @param isOpen - true if export dialog is open
 * @returns {JSX.Element} - label with icon for the export button component
 */
export function ExportButtonLabelComponent(isOpen: boolean): JSX.Element {
    const { t } = useTranslation(["Header"]);
    return (
        <div css={buttonLabelStyle(isOpen)}>
            <GetAppIcon fontSize="small" />
            {t("Header:Export")}
        </div>
    );
}
