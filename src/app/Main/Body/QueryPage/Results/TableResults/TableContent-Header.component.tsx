/** @jsx jsx */
import { jsx, SerializedStyles } from "@emotion/core";
import { withStyles, createStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import {
    primaryColor,
    onBackgroundColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";

const StyledTableCell = withStyles(() =>
    createStyles({
        head: {
            padding: "0.75em",
            color: onBackgroundColor,
            borderBottom: `1px solid ${primaryColor}`,
            letterSpacing: 0,
        },
        body: {
            color: onBackgroundColor,
            fontSize: 14,
        },
    })
)(TableCell);

interface TableHeaderProps {
    headerValues: string[],
    getSize: (
        node: HTMLElement | null,
        key: "height" | "totalWidth" | "partWidth"
    ) => void,
    isRowNotCol: boolean,
    isRowAndCol: boolean,
    style: (isRow: boolean, isRowAndCol: boolean) => SerializedStyles
}

/**
 * @desc Returns list of table cells for the table header
 * @param {string[]} headerValues - object with two boolans, true if row/column is selected
 * @param {(node: HTMLElement | null, key: "height" | "totalWidth" | "partWidth") => void} getSize - callback function to get the size of the header for the position of the main header
 * @param {boolean} isRowNotCol - true if row and no column is selected
 * @param {boolean} isRowAndCol - true if row and column is selected
 * @param {(isRow: boolean, isRowAndCol: boolean) => SerializedStyles} - style of the header
 * @returns {JSX.Element[]} - list of table cell components
 */
export function TableContentHeaderComponent(props: TableHeaderProps): JSX.Element[] {
    const elements: JSX.Element[] = [];
    elements.push(
        <StyledTableCell
            key="header-blank"
            ref={(node: HTMLElement | null) => props.getSize(node, "partWidth")}
            css={props.style(props.isRowNotCol, props.isRowAndCol)}
        >
            &nbsp;
        </StyledTableCell>
    );
    props.headerValues.forEach((element): void => {
        elements.push(
            <StyledTableCell
                key={`header-${element}`}
                css={props.style(props.isRowNotCol, props.isRowAndCol)}
            >
                {element}
            </StyledTableCell>
        );
    });
    return elements;
}
