/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@material-ui/core/TableCell";

function checkIfElementIsName(element: string): ["left" | "right", boolean] {
    if (element === "name") {
        return ["left", true];
    }
    return ["right", false];
}

const tableCellStyle = (isName: boolean): SerializedStyles => css`
    box-sizing: border-box;
    border-right: 1px solid lightgrey;
    :last-child {
        border-right: none;
    }
    width: ${isName ? "160px" : "auto"};
    min-width: ${isName ? "160px" : "auto"};
`;

export interface TableContentRowsProps {
    row: Record<string, string>;
    classes: Record<"tableCell", string>;
}

/**
 * @desc Returns list of table cells for one table row
 * @param {Record<string, string>} row - object with the values for the row
 * @param {Record<"tableCell", string>,} classes - material-ui styling of one table cell
 * @returns {JSX.Element} - list of table cell components
 */
export function TableContentRowsComponent(
    props: TableContentRowsProps
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    const k = Object.keys(props.row);
    k.forEach((element): void => {
        const [alignment, isName] = checkIfElementIsName(element);
        elements.push(
            <TableCell
                key={`isolates-${props.row.name}-${element}`}
                className={props.classes.tableCell}
                component="th"
                scope="row"
                align={alignment}
                css={tableCellStyle(isName)}
            >
                {props.row[element]}
            </TableCell>
        );
    });
    return elements;
}
