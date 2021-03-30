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
        statisticDataRelative: Record<string, string>[];
    };
    tableOption: DisplayOptionType;
    columnNameValues: string[];
}): JSX.Element {

    let tableData = props.tables.statisticDataAbsolute;
    if (props.tableOption === "relative") {
        tableData = props.tables.statisticDataRelative;
    }
    return (
        <div css={dataTableStyle}>
            <TableContentTableComponent
                tableData={tableData}
                columnNameValues={props.columnNameValues}
            />
        </div>
    );
}
