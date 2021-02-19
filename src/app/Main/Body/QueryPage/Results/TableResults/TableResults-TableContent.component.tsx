/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import { TableContentTableComponent } from "./TableContent-Table.component";
import { TableContext } from "../../../../../Shared/Context/TableContext";

const dataTableStyle = css`
    overflow: auto;
`;

export interface TableContentProps {
    columnAttributes: string[];
    isRowAndCol: boolean;
}

/**
 * @desc Decides if row/colum is selected and return result table or explanation text
 * @param {string[]} columnAttributes - column attributes for the table header
 * @param {boolean} isRowAndCol - true if row and column are selected
 * @returns {JSX.Element} - result table
 */
export function TableResultsTableContentComponent(
    props: TableContentProps
): JSX.Element {
    const { table } = useContext(TableContext);

    let tableData = table.statisticDataAbsolute;
    if (table.option === "percent") {
        tableData = table.statisticDataPercent;
    }
    return (
        <div
            css={dataTableStyle}
        >
            <TableContentTableComponent
                tableData={tableData}
                columnAttributes={props.columnAttributes}
                isRowAndCol={props.isRowAndCol}
            />
        </div>
    );
}
