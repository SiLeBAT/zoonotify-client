/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { TableContentTableComponent } from "./TableContent-Table.component";
import { DisplayOptionType } from "../../../../../Shared/Context/TableContext";

const dataTableStyle = css`
    overflow: auto;
`;

/**
 * @desc Decides if row/colum is selected and return result table or explanation text
 * @param {string[]} columnAttributes - column attributes for the table header
 * @returns {JSX.Element} - result table
 */
export function TableResultsTableContentComponent(props: {
    tables: {
        statisticDataAbsolute: Record<string, string>[];
        statisticDataPercent: Record<string, string>[];
    };
    tableOption: DisplayOptionType;
    columnAttributes: string[];
}): JSX.Element {

    let tableData = props.tables.statisticDataAbsolute;
    if (props.tableOption === "percent") {
        tableData = props.tables.statisticDataPercent;
    }
    return (
        <div css={dataTableStyle}>
            <TableContentTableComponent
                tableData={tableData}
                columnAttributes={props.columnAttributes}
            />
        </div>
    );
}
