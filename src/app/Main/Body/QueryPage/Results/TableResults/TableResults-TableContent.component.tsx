/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { TableContentTableComponent } from "./TableContent-Table.component";
import { DisplayOptionType } from "../../../../../Shared/Context/TableContext";

const dataTableStyle = css`
    overflow: auto;
`;

/**
 * @desc Decides if row/colum is selected and return result table or explanation text
 * @param columnAttributes - column attributes for the table header
 * @returns {JSX.Element} - result table
 */
export function TableResultsTableContentComponent(props: {
    isSumRowCol: boolean;
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
                isSumRowCol={props.isSumRowCol}
                tableData={tableData}
                tableOption={props.tableOption}
                columnNameValues={props.columnNameValues}
                displayOption={props.tableOption}
            />
        </div>
    );
}
