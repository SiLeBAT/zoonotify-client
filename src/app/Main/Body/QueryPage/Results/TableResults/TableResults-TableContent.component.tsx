/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import { TableContentTableComponent } from "./TableContent-Table.component";
import { TableContext } from "../../../../../Shared/Context/TableContext";

const dataTableStyle = css`
    overflow: auto;
`;

export interface TableContentProps {
    displayRowCol: {
        isCol: boolean;
        isRow: boolean;
    };
    columnAttributes: string[];
    getSize: (
        node: HTMLElement | null,
        key: "height" | "totalWidth" | "partWidth"
    ) => void;
}

/**
 * @desc Decides if row/colum is selected and return result table or explanation text
 * @param {{isCol: boolean;isRow: boolean;}} displayRowCol -  object with two booleans, true if row/column is selected
 * @param {string[]} columnAttributes - column attributes for the table header
 * @param {(node: HTMLElement | null, key: "height" | "totalWidth" | "partWidth") => void} getSize - callback function to get the size of the header for the main header
 * @returns {JSX.Element} - result table
 */
export function TableResultsTableContentComponent(
    props: TableContentProps
): JSX.Element {
    const { table } = useContext(TableContext);

    const isRowAndCol = props.displayRowCol.isCol && props.displayRowCol.isRow;
    const isRowNotCol = !props.displayRowCol.isCol && props.displayRowCol.isRow;

    let tableData = table.statisticDataAbsolute;
    if (table.option === "percent") {
        tableData = table.statisticDataPercent;
    }
    return (
        <div
            css={dataTableStyle}
            ref={(node: HTMLElement | null) =>
                props.getSize(node, "totalWidth")
            }
        >
            <TableContentTableComponent
                tableData={tableData}
                columnAttributes={props.columnAttributes}
                getSize={props.getSize}
                isRowNotCol={isRowNotCol}
                isRowAndCol={isRowAndCol}
            />
        </div>
    );
}
