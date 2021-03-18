/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@material-ui/core/TableCell";
import _ from "lodash";

const tableCellStyle = (isName: boolean): SerializedStyles => css`
    box-sizing: border-box;
    border-right: 1px solid lightgrey;
    :last-child {
        border-right: none;
    }
    width: ${isName ? "160px" : "auto"};
    min-width: ${isName ? "160px" : "auto"};
`;

/**
 * @desc Returns list of table cells for one table row
 * @param {Record<string, string>} row - object with the values for the row
 * @param {Record<"tableCell", string>,} classes - material-ui styling of one table cell
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
    const colKeys = _.pull(k, "name")
    colKeys.forEach((element): void => {
        elements.push(
            <TableCell
                key={`isolates-${props.row.name}-${element}`}
                className={props.classes.tableCell}
                component="th"
                scope="row"
                align="right"
                css={tableCellStyle(false)}
            >
                {props.row[element]}
            </TableCell>
        );
    });
    return elements;
}
