/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import {
    onPrimaryColor,
    primaryColor,
} from "../../../../../../../Shared/Style/Style-MainTheme";
import {
    fixedCellSizeIcon,
    fixedCellSizeRowValue,
    isColHeight,
    isOnlyRowHeight,
    isOnlyRowWidth,
} from "../ResultsTable.style";

const spacerStyle = (
    spacerWidth: number,
    spacerHeight: number
): SerializedStyles => css`
    width: ${`${spacerWidth}px`};
    height: ${`${spacerHeight}px`};
`;

const titleDivStyle = (isRow: boolean): SerializedStyles => css`
    display: flex;
    flex-direction: ${isRow ? "column" : "row"};
    align-items: center;
    background-color: ${primaryColor};
`;
const tableTitleStyle = (isRow: boolean): SerializedStyles => css`
    display: flex;
    margin: 0;
    color: ${onPrimaryColor};
    writing-mode: ${isRow ? "vertical-lr" : "none"};
    transform: ${isRow ? "rotate(180deg)" : "none"};
    padding-top: ${isRow ? "0.5em" : "0"};
    padding-right: ${isRow ? "0" : "0.5em"};
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
    isSubFilter: boolean;
    /**
     *  text content of the main header
     */
    text: string;
}

/**
 * @desc Returns one main header to wrap the result table
 * @param props - info about isRow & isRowAndCol, text of main header
 * @returns {JSX.Element} - one main header component
 */
export function TableMainHeaderComponent(
    props: TableMainHeaderProps
): JSX.Element {
    let spaceWidth = fixedCellSizeRowValue;

    if (props.isRow) {
        spaceWidth = isOnlyRowWidth;
    } else if (props.isRowAndCol && props.isSubFilter) {
        spaceWidth = fixedCellSizeRowValue + fixedCellSizeIcon + isColHeight;
    } else if (props.isRowAndCol && !props.isSubFilter) {
        spaceWidth = fixedCellSizeRowValue + isColHeight;
    }

    const spacerHeight = props.isRow ? isOnlyRowHeight : isColHeight;

    return (
        <div css={titleDivStyle(props.isRow)}>
            <div css={spacerStyle(spaceWidth, spacerHeight)}>&nbsp;</div>
            <p css={tableTitleStyle(props.isRow)}>{props.text}</p>
        </div>
    );
}
