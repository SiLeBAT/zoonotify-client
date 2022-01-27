/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { secondaryColor } from "./Style/Style-MainTheme";

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
export function ButtonLabelComponent(
    buttonText: string,
    isOpen: boolean,
    buttonIcon?: JSX.Element
): JSX.Element {
    return (
        <div css={buttonLabelStyle(isOpen)}>
            {buttonIcon}
            {buttonText}
        </div>
    );
}
