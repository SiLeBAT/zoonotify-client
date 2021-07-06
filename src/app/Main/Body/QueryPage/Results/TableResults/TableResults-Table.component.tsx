/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { LoadingProcessComponent } from "../../../../../Shared/LoadingProcess.component";
import { DisplayOptionType } from "../../../../../Shared/Context/TableContext";
import { TableContentTableContainerComponent } from "./TableContent-TableContainer.component";
import { TableResultsTableMainHeaderComponent } from "./TableResults-TableMainHeader.component";

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
    isSumRowCol: { showRowSum: boolean; showColSum: boolean };
    isLoading: boolean;
    displayRowCol: {
        isCol: boolean;
        isRow: boolean;
    };
    colMainHeader: string;
    rowMainHeader: string;
    tableData: Record<string, string>[];
    tableOption: DisplayOptionType;
    columnNameValues: string[];
}): JSX.Element {
    if (props.isLoading) {
        return <LoadingProcessComponent />;
    }
    return (
        <div>
            {props.displayRowCol.isCol && (
                <TableResultsTableMainHeaderComponent
                    isRow={false}
                    text={props.colMainHeader}
                    isRowAndCol={
                        props.displayRowCol.isCol && props.displayRowCol.isRow
                    }
                />
            )}
            <div css={tableDivStyle}>
                {props.displayRowCol.isRow && (
                    <TableResultsTableMainHeaderComponent
                        isRow
                        text={props.rowMainHeader}
                        isRowAndCol={
                            props.displayRowCol.isCol &&
                            props.displayRowCol.isRow
                        }
                    />
                )}
                <div css={dataTableStyle}>
                    <TableContentTableContainerComponent
                        isSumRowCol={props.isSumRowCol}
                        isCol={props.displayRowCol.isCol}
                        tableData={props.tableData}
                        columnNameValues={props.columnNameValues}
                        displayOption={props.tableOption}
                    />
                </div>
            </div>
        </div>
    );
}
