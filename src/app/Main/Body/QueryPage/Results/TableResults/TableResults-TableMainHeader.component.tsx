/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import {
    onPrimaryColor,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";

const spacerStyle = (isRow: boolean, colWidth: number): SerializedStyles => css`
    width: ${isRow ? "40px" : `${colWidth}px`};
    height: ${isRow ? "50px" : "40px"};
`;

const titleDivStyle = (
    isRow: boolean,
    isTitle: boolean
): SerializedStyles => css`
    display: ${isTitle ? "flex" : "none"};
    flex-direction: ${isRow ? "column" : "row"};
    align-items: center;
    background-color: ${primaryColor};
`;
const tableTitleStyle = (
    isRow: boolean,
    isTitle: boolean
): SerializedStyles => css`
    display: ${isTitle ? "flex" : "none"};
    margin: 0;
    color: ${onPrimaryColor};
    writing-mode: ${isRow ? "vertical-lr" : "none"};
    transform: ${isRow ? "rotate(180deg)" : "none"};
`;

export interface TableMainHeaderProps {
    isRow: boolean;
    isRowAndCol: boolean;
    text: string;
    isTitle: boolean;
}

/**
 * @desc Returns one main header to wrap the result table
 * @param {boolean} isRow - true if row is selected
 * @param {string} text - text content of the main header
 * @returns {JSX.Element} - one main header component
 */
export function TableResultsTableMainHeaderComponent(
    props: TableMainHeaderProps
): JSX.Element {
    const colWidth = props.isRowAndCol ? 200 : 160;
    return (
        <div css={titleDivStyle(props.isRow, props.isTitle)}>
            <div css={spacerStyle(props.isRow, colWidth)}>&nbsp;</div>
            <p css={tableTitleStyle(props.isRow, props.isTitle)}>
                {props.text}
            </p>
        </div>
    );
}
