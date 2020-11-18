/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import {
    backgroundColor,
    primaryColor,
} from "../../../../Shared/Style/Style-MainTheme.component";

const titleDivStyle = (
    isTitle: boolean,
    isRow: boolean
): SerializedStyles => css`
    display: ${isTitle ? "flex" : "none"};
    align-items: ${isRow ? "flex-end" : "center"};
    justify-content: ${isRow ? "center" : "flex-end"};
    background-color: ${backgroundColor};
    border-right: ${isRow
        ? `double ${primaryColor}`
        : `1px solid ${primaryColor}`};
    border-bottom: ${isRow
        ? `1px solid ${primaryColor}`
        : `double ${primaryColor}`};
`;
const tableTitleStyle = (
    isTitle: boolean,
    isRow: boolean,
    height: number,
    width: number
): SerializedStyles => css`
    display: ${isTitle ? "flex" : "none"};
    width: ${isRow ? "inherit" : `${width}px`};
    height: ${isRow ? `${height}px` : "inherit"};
    margin: 0;
    padding: ${isRow ? "0 0.3em" : "0.2em 0"};
    justify-content: center;
    align-items: center;
    font-weight: normal;
    background-color: ${backgroundColor};
    color: ${primaryColor};
`;

interface TestInterface {
    isTitle: boolean;
    isRow: boolean;
    height: number;
    width: number;
    text: string;
}

export function TableMainHeaderComponent(props: TestInterface): JSX.Element {
    return (
        <div css={titleDivStyle(props.isTitle, props.isRow)}>
            <h4
                css={tableTitleStyle(
                    props.isTitle,
                    props.isRow,
                    props.height,
                    props.width
                )}
            >
                {props.text}
            </h4>
        </div>
    );
}
