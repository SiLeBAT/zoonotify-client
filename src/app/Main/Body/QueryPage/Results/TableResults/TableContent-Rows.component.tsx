/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@material-ui/core/TableCell";
import _ from "lodash";
import {
    bfrPrimaryPalette,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";

const tableCellStyle = (isName: boolean): SerializedStyles => css`
    box-sizing: border-box;
    border-right: 1px solid lightgrey;
    width: ${isName ? "160px" : "auto"};
    min-width: ${isName ? "160px" : "auto"};
`;
const sumTableCellStyle = css`
    box-sizing: border-box;
    border-right: 1px solid lightgrey;
    border-left: 1px solid ${primaryColor};
    background-color: ${bfrPrimaryPalette[50]};
`;

/**
 * @desc Returns list of table cells for one table row
 * @param row - object with the values for the row
 * @param classes - material-ui styling of one table cell
 * @returns {JSX.Element} - list of table cell components
 */
export function TableContentRowsComponent(props: {
    row: Record<string, string>;
    classes: Record<"tableCell", string>;
}): JSX.Element[] {
    const elements: JSX.Element[] = [];
    elements.push(
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
    const k = Object.keys(props.row);
    const colKeys = _.pull(k, "name");
    let rowSum = 0;
    colKeys.forEach((colKey): void => {
        const cellNumber = props.row[colKey]
        rowSum += Number.parseFloat(cellNumber);
        elements.push(
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
    elements.push(
        <TableCell
            key="isolates-row-sum"
            className={props.classes.tableCell}
            component="th"
            scope="row"
            align="right"
            css={sumTableCellStyle}
        >
            {rowSum}
        </TableCell>
    );
    return elements;
}
