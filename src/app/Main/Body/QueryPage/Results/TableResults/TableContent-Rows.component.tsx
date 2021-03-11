/** @jsx jsx */
import { jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@material-ui/core/TableCell";
import _ from "lodash";

export interface TableContentRowsProps {
    row: Record<string, string>;
    classes: Record<"tableCell", string>;
    isRowAndCol: boolean;
    style: (isRow: boolean, isRowAndCol: boolean) => SerializedStyles;
}

/**
 * @desc Returns list of table cells for one table row
 * @param {Record<string, string>} row - object with the values for the row
 * @param {Record<"tableCell", string>,} classes - material-ui styling of one table cell
 * @param {boolean} isRowAndCol - true if row and column is selected
 * @param {(isRow: boolean, isRowAndCol: boolean) => SerializedStyles} - style of the row
 * @returns {JSX.Element} - list of table cell components
 */
export function TableContentRowsComponent(
    props: TableContentRowsProps
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    elements.push(
        <TableCell
            key={`isolates-${props.row.name}-name`}
            className={props.classes.tableCell}
            component="th"
            scope="row"
            align="left"
            css={props.style(true, props.isRowAndCol)}
        >
            {props.row.name}
        </TableCell>
    );
    const k = Object.keys(props.row);
    const colKeys = _.pull(k, "name")
    colKeys.forEach((element): void => {
        elements.push(
            <TableCell
                key={`isolates-${props.row.name}-${element}`}
                className={props.classes.tableCell}
                component="th"
                scope="row"
                align="right"
                css={props.style(true, props.isRowAndCol)}
            >
                {props.row[element]}
            </TableCell>
        );
    });
    return elements;
}
