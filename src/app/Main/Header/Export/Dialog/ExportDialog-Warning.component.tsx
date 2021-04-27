/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { errorColor } from "../../../../Shared/Style/Style-MainTheme.component";

const warningStyle = (isSelect: boolean): SerializedStyles => css`
    display: ${isSelect ? "none" : "flex"};
    color: ${errorColor};
    margin-left: 2em;
    font-size: 0.75rem;
`;

export interface ExportActionButtonProps {
    fileIsSelect: boolean;
}

/**
 * @desc Returns warning if no checkbox for file export is selected
 * @param props
 * @returns {JSX.Element} - warning component
 */
export function ExportDialogWarningComponent(
    props: ExportActionButtonProps
): JSX.Element {
    const { t } = useTranslation(["Export"]);
    
    return <p css={warningStyle(props.fileIsSelect)}>{t("Warning")}</p>;
}
