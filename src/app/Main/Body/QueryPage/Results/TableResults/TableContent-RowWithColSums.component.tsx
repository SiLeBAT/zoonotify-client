/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@material-ui/core/TableCell";
import _ from "lodash";
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

function calculateColSum(
    tableData: Record<string, string>[],
    headerValue: string
): number {
    const colNumbers: number[] = tableData.map((tableRow) => {
        const colNumber = tableRow[headerValue];
        if (colNumber !== undefined) {
            return Number.parseFloat(colNumber);
        }
        return 0;
    });

    return _.sum(colNumbers);
}

export function TableContentRowWithColSumComponent(props: {
    showRowSum: boolean;
    tableData: Record<string, string>[];
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

    let totalColSum = 0

    props.headerValues.forEach((headerValue) => {
        const colSum: number = calculateColSum(
            props.tableData,
            headerValue
        );

        totalColSum += colSum

        let colSumString = colSum.toString()

        if (props.displayOption === "relative") {
            colSumString = colSum.toFixed(2);
        }

        arrayWithColSumCells.push(
            <TableCell
                key={`isolates-col-sum-${headerValue}`}
                className={props.classes.tableCell}
                component="th"
                scope="row"
                align="right"
                css={tableCellStyle(false)}
            >
                {colSumString}
            </TableCell>
        );
    });

    let totalColSumString: string = totalColSum.toString()

    if (props.displayOption === "relative") {
        totalColSumString = totalColSum.toFixed(0);
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
