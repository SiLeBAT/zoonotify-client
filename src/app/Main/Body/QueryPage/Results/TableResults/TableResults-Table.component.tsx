/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { LoadingProcessComponent } from "../../../../../Shared/LoadingProcess.component";
import { DisplayOptionType } from "../../../../../Shared/Context/TableContext";
import { TableContentTableContainerComponent } from "./TableContent-TableContainer.component";
import { TableResultsTableMainHeaderComponent } from "./TableResults-TableMainHeader.component";
import { DisplayRowCol, SumOptions } from "./TableResults.model";

const dataTableStyle = css`
    overflow: auto;
`;
const tableDivStyle = css`
    display: flex;
    flex-direction: row;
`;

/**
 * @desc Decides if row/colum is selected and return result table or explanation text
 * @param columnAttributes - column attributes for the table header
 * @returns {JSX.Element} - result table
 */
export function TableResultsTableComponent(props: {
    sumOptions: SumOptions;
    isLoading: boolean;
    displayRowCol: DisplayRowCol;
    colMainHeader: string;
    rowMainHeader: string;
    tableData: Record<string, string>[];
    tableOption: DisplayOptionType;
    columnNameValues: string[];
    colAttribute: string;
    rowAttribute: string;
}): JSX.Element {
    if (props.isLoading) {
        return <LoadingProcessComponent />;
    }

    const isRowAndCol = props.displayRowCol.isCol && props.displayRowCol.isRow
    return (
        <div>
            {props.displayRowCol.isCol && (
                <TableResultsTableMainHeaderComponent
                    isRow={false}
                    text={props.colMainHeader}
                    isRowAndCol={isRowAndCol}
                />
            )}
            <div css={tableDivStyle}>
                {props.displayRowCol.isRow && (
                    <TableResultsTableMainHeaderComponent
                        isRow
                        text={props.rowMainHeader}
                        isRowAndCol={isRowAndCol}
                    />
                )}
                <div css={dataTableStyle}>
                    <TableContentTableContainerComponent
                        sumOptions={props.sumOptions}
                        tableData={props.tableData}
                        colAttribute={props.colAttribute}
                        rowAttribute={props.rowAttribute}
                        displayRowCol={props.displayRowCol}
                        columnNameValues={props.columnNameValues}
                        displayOption={props.tableOption}
                    />
                </div>
            </div>
        </div>
    );
}
