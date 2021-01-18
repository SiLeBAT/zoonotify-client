/** @jsx jsx */
import { jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@material-ui/core/TableCell";

function chooseAlignment(element: string): "left" | "right" {
    if (element === "name") {
        return "left";
    }
    return "right";
}

interface TableRowsProps {
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
    props: TableRowsProps
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    const k = Object.keys(props.row);
    k.forEach((element): void => {
        elements.push(
            <TableCell
                key={`isolates-${props.row.name}-${element}`}
                className={props.classes.tableCell}
                component="th"
                scope="row"
                align={chooseAlignment(element)}
                css={props.style(true, props.isRowAndCol)}
            >
                {props.row[element]}
            </TableCell>
        );
    });
    return elements;
}
