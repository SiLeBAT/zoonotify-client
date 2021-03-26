/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import {
    onPrimaryColor,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";

const spacerStyle = (isRow: boolean, isRowAndCol: boolean): SerializedStyles => css`
    width: ${isRow ? "40px" : (isRowAndCol ? "200px" : "160px")};
    height: ${isRow ? "50px" : "40px"};
`;

const titleDivStyle = (
    isRow: boolean,
): SerializedStyles => css`
    display: flex;
    flex-direction: ${isRow ? "column" : "row"};
    align-items: center;
    background-color: ${primaryColor};
`;
const tableTitleStyle = (
    isRow: boolean,
): SerializedStyles => css`
    display: flex;
    margin: 0;
    color: ${onPrimaryColor};
    writing-mode: ${isRow ? "vertical-lr" : "none"};
    transform: ${isRow ? "rotate(180deg)" : "none"};
`;

export interface TableMainHeaderProps {
    /**
     *  true if row is selected
     */
    isRow: boolean;
    /**
     *  true if row and col are selected
     */
    isRowAndCol: boolean;
     /**
     *  text content of the main header
     */
    text: string;
}

/**
 * @desc Returns one main header to wrap the result table
 * @param {TableMainHeaderProps} props - info about isRow & isRowAndCol, text of main header
 * @returns {JSX.Element} - one main header component
 */
export function TableResultsTableMainHeaderComponent(
    props: TableMainHeaderProps
): JSX.Element {
    return (
        <div css={titleDivStyle(props.isRow)}>
            <div css={spacerStyle(props.isRow, props.isRowAndCol)}>&nbsp;</div>
            <p css={tableTitleStyle(props.isRow)}>
                {props.text}
            </p>
        </div>
    );
}
