/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { IconButton, Tooltip } from "@mui/material";
import withStyles from '@mui/styles/withStyles';
import CancelIcon from "@mui/icons-material/Cancel";
import {
    onBackgroundColor,
    primaryColor,
} from "./Style/Style-MainTheme.component";

const buttonAreaStyle = css`
    margin-top: auto;
    display: flex;
    align-items: center;
`;

const iconButtonStyle = css`
    height: fit-content;
    padding: 0;
    color: ${primaryColor};
`;

const LightTooltip = withStyles(() => ({
    tooltip: {
        backgroundColor: "transparent",
        color: onBackgroundColor,
        fontSize: "9px",
        margin: "0.2em",
    },
}))(Tooltip);

/**
 * @desc Button and tooltip to clear all selected settings.
 * @param props - onclick to remove the selected values
 * @returns {JSX.Element} - button component with tooltip
 */
export function ClearSelectorComponent(props: {
    onClick: () => void;
    disabled: boolean;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const mouseOverText = t("QueryPage:Buttons.Delete");

    const handleClick = (): void => props.onClick();

    return (
        <div css={buttonAreaStyle}>
            <LightTooltip title={mouseOverText} placement="top">
                <IconButton
                    css={iconButtonStyle}
                    onClick={handleClick}
                    disabled={props.disabled}
                    size="large">
                    <CancelIcon
                        css={css`
                            height: 20px;
                            width: 20px;
                        `}
                    />
                </IconButton>
            </LightTooltip>
        </div>
    );
}
