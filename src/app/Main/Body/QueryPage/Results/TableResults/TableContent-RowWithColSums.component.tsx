/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@material-ui/core/TableCell";
import _ from "lodash";
import { backgroundColor } from "../../../../../Shared/Style/Style-MainTheme.component";
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

const emptyCellStyle = css`
    border-right: none;
    border-bottom: none;
    border-top: ${highlightedTableBorder};
    border-left: ${highlightedTableBorder};
    background-color: ${backgroundColor};
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

    props.headerValues.forEach((headerValue) => {
        let colSum: number | string = calculateColSum(
            props.tableData,
            headerValue
        );

        if (props.displayOption === "relative") {
            colSum = colSum.toFixed(2);
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
                {colSum}
            </TableCell>
        );
    });
    if (props.showRowSum) {
        arrayWithColSumCells.push(
            <TableCell css={emptyCellStyle} key="sum-blank">
                &nbsp;
            </TableCell>
        );
    }
    return arrayWithColSumCells;
}
