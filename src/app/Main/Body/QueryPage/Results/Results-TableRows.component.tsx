import React from "react";
import TableCell from "@material-ui/core/TableCell";

function chooseAlignment(element: string): "left" | "right" {
    if (element === "name") {
        return "left";
    }
    return "right";
}

export function RowValues(
    row: Record<string, string>,
    classes: Record<"tableCell", string>
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
            >
                {row[element]}
            </TableCell>
        );
    });
    return elements;
}
