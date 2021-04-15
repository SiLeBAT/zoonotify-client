/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@material-ui/core/TableCell";
import _ from "lodash";
import {
    backgroundColor,
    bfrPrimaryPalette,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";

const tableCellStyle = (isName: boolean): SerializedStyles => css`
    box-sizing: border-box;
    border-right: 1px solid lightgrey;
    border-top: 1px solid ${primaryColor};
    background-color: ${bfrPrimaryPalette[50]};
    width: ${isName ? "160px" : "auto"};
    min-width: ${isName ? "160px" : "auto"};
`;

const emptyCellStyle = css`
    border-right: none;
    border-bottom: none;
    border-top: 1px solid ${primaryColor};
    border-left: 1px solid ${primaryColor};
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
        return Number.NaN;
    });

    return _.sum(colNumbers);
}

export function TableContentRowWithColSumComponent(props: {
    tableData: Record<string, string>[];
    headerValues: string[];
    classes: Record<"tableCell", string>;
}): JSX.Element[] {
    const arrayWithColSumCells: JSX.Element[] = [
        <TableCell
            key="header-colum-sum"
            className={props.classes.tableCell}
            component="th"
            scope="row"
            align="left"
            css={tableCellStyle(true)}
        >
            Spaltensumme
        </TableCell>,
    ];

    props.headerValues.forEach((headerValue) => {
        const colSum: number = calculateColSum(props.tableData, headerValue);

        if (!Number.isNaN(colSum)) {
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
        }
    });
    arrayWithColSumCells.push(
        <TableCell css={emptyCellStyle} key="sum-blank">
            &nbsp;
        </TableCell>
    );
    return arrayWithColSumCells;
}
