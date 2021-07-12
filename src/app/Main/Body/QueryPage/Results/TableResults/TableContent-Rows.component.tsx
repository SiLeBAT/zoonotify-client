/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@material-ui/core/TableCell";
import {
    highlightedTableBorder,
    fixedCellSize,
    defaultTableBorder,
    sumRowColBackgroundColor,
} from "./ResultsTable.style";

const tableCellStyle = (isName: boolean): SerializedStyles => css`
    box-sizing: border-box;
    border-right: ${defaultTableBorder};
    width: ${isName ? `${fixedCellSize}px` : "auto"};
    min-width: ${isName ? `${fixedCellSize}px` : "auto"};
`;
const sumTableCellStyle = css`
    box-sizing: border-box;
    border-right: ${defaultTableBorder};
    border-left: ${highlightedTableBorder};
    background-color: ${sumRowColBackgroundColor};
`;

/**
 * @desc Returns list of table cells for one table row
 * @param row - object with the values for the row
 * @param classes - material-ui styling of one table cell
 * @returns {JSX.Element} - list of table cell components
 */
export function TableContentRowsComponent(props: {
    showRowSum: boolean;
    row: Record<string, string>;
    classes: Record<"tableCell", string>;
    displayOption: string;
    colKeys: string[];
}): JSX.Element[] {
    const rowCells: JSX.Element[] = [];
    rowCells.push(
        <TableCell
            key={`isolates-${props.row.name}-name`}
            className={props.classes.tableCell}
            component="th"
            scope="row"
            align="left"
            css={tableCellStyle(true)}
        >
            {props.row.name}
        </TableCell>
    );
    let rowSum = 0;
    props.colKeys.forEach((colKey): void => {
        const cellNumber = props.row[colKey];
        rowSum += Number.parseFloat(cellNumber);
        rowCells.push(
            <TableCell
                key={`isolates-${props.row.name}-${colKey}`}
                className={props.classes.tableCell}
                component="th"
                scope="row"
                align="right"
                css={tableCellStyle(false)}
            >
                {cellNumber}
            </TableCell>
        );
    });

    if (props.showRowSum) {
        let rowSumString = rowSum.toString();
        if (props.displayOption === "relative") {
            rowSumString = rowSum.toFixed(2);
        }
        rowCells.push(
            <TableCell
                key="isolates-row-sum"
                className={props.classes.tableCell}
                component="th"
                scope="row"
                align="right"
                css={sumTableCellStyle}
            >
                {rowSumString}
            </TableCell>
        );
    }
    return rowCells;
}
