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
    border-top: ${highlightedTableBorder};
    background-color: ${sumRowColBackgroundColor};
    width: ${isName ? `${fixedCellSize}px` : "auto"};
    min-width: ${isName ? `${fixedCellSize}px` : "auto"};
`;

const totalSumStyle = css`
    border-right: none;
    border-bottom: none;
    border-top: ${highlightedTableBorder};
    border-left: ${highlightedTableBorder};
    background-color: ${sumRowColBackgroundColor};
`;

export function TableContentRowWithColSumComponent(props: {
    showRowSum: boolean;
    numberOfIsolates: number;
    rowWithColSums: Record<string, string>[];
    headerValues: string[];
    classes: Record<"tableCell", string>;
    colSumLabel: string;
    displayOption: string;
}): JSX.Element[] {
    const arrayWithColSumCells: JSX.Element[] = [
        <TableCell
            key="header-column-sum"
            className={props.classes.tableCell}
            component="th"
            scope="row"
            align="left"
            css={tableCellStyle(true)}
        >
            {props.colSumLabel}
        </TableCell>,
    ];

    const totalColSum = props.numberOfIsolates;

    props.headerValues.forEach((headerValue) => {
        arrayWithColSumCells.push(
            <TableCell
                key={`isolates-col-sum-${headerValue}`}
                className={props.classes.tableCell}
                component="th"
                scope="row"
                align="right"
                css={tableCellStyle(false)}
            >
                {props.rowWithColSums[0][headerValue]}
            </TableCell>
        );
    });

    let totalColSumString: string = totalColSum.toString();

    if (props.displayOption === "relative") {
        totalColSumString = "100.0";
    }

    if (props.showRowSum) {
        arrayWithColSumCells.push(
            <TableCell
                css={totalSumStyle}
                className={props.classes.tableCell}
                key="sum-total"
                align="right"
            >
                {totalColSumString}
            </TableCell>
        );
    }
    return arrayWithColSumCells;
}
