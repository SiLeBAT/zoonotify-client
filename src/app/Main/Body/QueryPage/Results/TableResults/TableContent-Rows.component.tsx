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
    row: Record<string, string>,
    classes: Record<"tableCell", string>,
    isRowAndCol: boolean,
    style: (
        isRow: boolean,
        isRowAndCol: boolean
    ) => SerializedStyles
}

export function TableContentRowsComponent(props: TableRowsProps): JSX.Element[] {
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
