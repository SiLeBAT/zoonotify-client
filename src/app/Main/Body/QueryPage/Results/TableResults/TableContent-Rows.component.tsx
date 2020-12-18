/** @jsx jsx */
import { jsx, SerializedStyles } from "@emotion/core";
import TableCell from "@material-ui/core/TableCell";

function chooseAlignment(element: string): "left" | "right" {
    if (element === "name") {
        return "left";
    }
    return "right";
}

export function RowValues(
    row: Record<string, string>,
    classes: Record<"tableCell", string>,
    isRowAndCol: boolean,
    style: (
        isRow: boolean,
        isRowAndCol: boolean
    ) => SerializedStyles
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    const k = Object.keys(row);
    k.forEach((element): void => {
        elements.push(
            <TableCell
                key={`isolates-${row.name}-${element}`}
                className={classes.tableCell}
                component="th"
                scope="row"
                align={chooseAlignment(element)}
                css={style(true, isRowAndCol)}
            >
                {row[element]}
            </TableCell>
        );
    });
    return elements;
}
