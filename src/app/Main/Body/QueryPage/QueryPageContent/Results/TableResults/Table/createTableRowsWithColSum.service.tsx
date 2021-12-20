/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@mui/material/TableCell";
import {
    defaultTableBorder,
    fixedCellSize,
    highlightedTableBorder,
    sumRowColBackgroundColor,
} from "../ResultsTable.style";

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

export function createTableRowWithColSumService(props: {
    showRowSum: boolean;
    rowWithColSums: Record<string, string> | undefined;
    headerValues: string[];
    colSumLabel: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    style: Record<string, string | number>;
}): JSX.Element[] {
    const arrayWithColSumCells: JSX.Element[] = [
        <TableCell
            key="header-column-sum"
            sx={props.style}
            component="th"
            scope="row"
            align="left"
            css={tableCellStyle(true)}
        >
            {props.colSumLabel}
        </TableCell>,
    ];

    if (props.rowWithColSums !== undefined) {
        const { rowWithColSums } = props;
        props.headerValues.forEach((headerValue) => {
            arrayWithColSumCells.push(
                <TableCell
                    key={`isolates-col-sum-${headerValue}`}
                    sx={props.style}
                    component="th"
                    scope="row"
                    align="right"
                    css={tableCellStyle(false)}
                >
                    {rowWithColSums[headerValue]}
                </TableCell>
            );
        });
    }

    if (props.showRowSum && props.rowWithColSums !== undefined) {
        const totalSum = props.rowWithColSums.rowSum;
        arrayWithColSumCells.push(
            <TableCell
                css={totalSumStyle}
                sx={props.style}
                key="sum-total"
                align="right"
            >
                {totalSum}
            </TableCell>
        );
    }
    return arrayWithColSumCells;
}