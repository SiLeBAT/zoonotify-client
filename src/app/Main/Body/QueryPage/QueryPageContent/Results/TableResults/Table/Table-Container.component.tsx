import React from "react";
import { useTranslation } from "react-i18next";
import { TableRow } from "@mui/material";
import {
    DisplayOptionType,
    SubFilterDataType,
} from "../../../../../../../Shared/Context/DataContext";
import { TableContentLayout } from "./TableContent-Layout.component";
import { TableMainHeaderComponent } from "./TableMainHeader.component";
import { SumOptions } from "../TableResults.model";
import { TableLayout } from "./Table-Layout.component";
import { createTableRowsService } from "./createTableRows.service";
import { createTableHeaderService } from "./createTableHeader.service";
import { createTableRowWithColSumService } from "./createTableRowsWithColSum.service";
import { onBackgroundColor } from "../../../../../../../Shared/Style/Style-MainTheme";

/**
 * @desc Decides if row/colum is selected and return result table or explanation text
 * @param columnAttributes - column attributes for the table header
 * @returns {JSX.Element} - result table
 */
export function TableContainer(props: {
    sumOptions: SumOptions;
    colMainHeader: string;
    rowMainHeader: string;
    tableData: Record<string, string>[];
    subTableData: SubFilterDataType;
    tableOption: DisplayOptionType;
    columnNameValues: string[];
    colAttribute: string;
    rowAttribute: string;
    isSubFilter: boolean;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const isCol = props.colAttribute !== "";
    const isRow = props.rowAttribute !== "";

    let columnMainHeader: JSX.Element | undefined;

    const tableCellStyle = {
        wordWrap: "break-word",
        padding: "0.75em",
        color: onBackgroundColor,
        letterSpacing: 0,
    };

    if (isCol) {
        columnMainHeader = (
            <TableMainHeaderComponent
                isRow={false}
                isSubFilter={props.isSubFilter}
                text={props.colMainHeader}
                isRowAndCol={isCol && isRow}
            />
        );
    }

    let rowMainHeader: JSX.Element | undefined;

    if (isRow) {
        rowMainHeader = (
            <TableMainHeaderComponent
                isRow
                isSubFilter={props.isSubFilter}
                text={props.rowMainHeader}
                isRowAndCol={isCol && isRow}
            />
        );
    }

    const [tableHeader, tableValuesHeader] = createTableHeaderService({
        showRowSum: props.sumOptions.showRowSum,
        headerValues: props.columnNameValues,
        colAttribute: props.colAttribute,
        tableOption: props.tableOption,
        isCol,
        isSubFilter: props.isSubFilter,
    });

    const tableRows: JSX.Element[] = props.tableData
        .filter((row) => row.name !== "colSum")
        .map((row) =>
            createTableRowsService({
                showRowSum: props.sumOptions.showRowSum,
                row,
                rowAttribute: props.rowAttribute,
                displayRow: isRow,
                displayOption: props.tableOption,
                colKeys: props.columnNameValues,
                style: tableCellStyle,
                tableHeader: tableValuesHeader,
                subTableData: props.subTableData,
            })
        );

    if (props.sumOptions.showColSum) {
        const rowWithColSums = props.tableData.filter(
            (row) => row.name === "colSum"
        )[0];

        tableRows.push(
            <TableRow key="row-with-column-sum">
                {createTableRowWithColSumService({
                    showRowSum: props.sumOptions.showRowSum,
                    isSubFilter: props.isSubFilter,
                    rowWithColSums,
                    headerValues: props.columnNameValues,
                    colSumLabel: t("Sums.ColSum"),
                    style: tableCellStyle,
                })}
            </TableRow>
        );
    }

    return (
        <TableLayout
            columnMainHeader={columnMainHeader}
            rowMainHeader={rowMainHeader}
            table={
                <TableContentLayout
                    tableHeader={tableHeader}
                    tableRows={tableRows}
                />
            }
        />
    );
}
