import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    DialogButton,
    DialogComponent,
} from "../../shared/components/dialog/Dialog.component";

import { AmrsTable, AmrsTableData } from "../model/ExplanationPage.model";

const tableTextStyle = {
    fontSize: "0.75rem",
    letterSpacing: "0",
    whiteSpace: "nowrap",
} as const;

function createTableRowCells(row: AmrsTableData): JSX.Element[] {
    const tableCellList: JSX.Element[] = [];
    tableCellList.push(
        <TableCell
            sx={tableTextStyle}
            component="td"
            scope="row"
            key={`amr-table-cell-${row.amrSubstance}-short`}
        >
            {row.shortSubstance}
        </TableCell>,
        <TableCell
            sx={tableTextStyle}
            component="td"
            scope="row"
            key={`amr-table-cell-${row.amrSubstance}-substanceClass`}
        >
            {row.substanceClass}
        </TableCell>,

        <TableCell
            sx={tableTextStyle}
            component="td"
            scope="row"
            key={`amr-table-cell-${row.amrSubstance}-substanceClass`}
        >
            {row.wirkstoff}
        </TableCell>
    );

    for (const year of Object.keys(row.concentrationList)) {
        const concentrationPerYear = row.concentrationList[year];
        tableCellList.push(
            <TableCell
                sx={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-${year}-cutOff`}
            >
                {concentrationPerYear.cutOff}
            </TableCell>,
            <TableCell
                sx={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-${year}-min`}
            >
                {concentrationPerYear.min}
            </TableCell>,
            <TableCell
                sx={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-${year}-max`}
            >
                {concentrationPerYear.max}
            </TableCell>
        );
    }

    return tableCellList;
}

export function InfoPageAmrDialogComponent(props: {
    resistancesTableData: AmrsTable;
    onClose: () => void;
    onAmrDataExport: () => void;
}): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);

    const handleClose = (): void => {
        props.onClose();
    };

    const handleSubmit = (): void => {
        props.onAmrDataExport();
    };

    const tableSubHeader: JSX.Element[] = [];

    for (const subHeaderKey of Object.keys(
        props.resistancesTableData.tableSubHeader
    )) {
        props.resistancesTableData.tableSubHeader[subHeaderKey].forEach(
            (subHeaderValue: string) => {
                tableSubHeader.push(
                    <TableCell
                        key={`subheader-amr-${subHeaderKey}-${subHeaderValue}`}
                        sx={tableTextStyle}
                        component="th"
                        align="right"
                    >
                        {subHeaderValue}
                    </TableCell>
                );
            }
        );
    }

    const nrOfSubstanceHeaderCells = 3;
    const substanceTableHeader = [];
    const spacingCells = [];

    for (let i = 0; i < nrOfSubstanceHeaderCells; i += 1) {
        substanceTableHeader.push(
            <TableCell
                key={`header-amr-${props.resistancesTableData.tableHeader[i]}`}
                sx={tableTextStyle}
                component="th"
                colSpan={1}
            >
                {props.resistancesTableData.tableHeader[i]}
            </TableCell>
        );
        spacingCells.push(
            <TableCell
                key={`header-amr-emptyCell-class-${i}`}
                sx={tableTextStyle}
                component="th"
                align="right"
            >
                &nbsp;
            </TableCell>
        );
    }

    const dialogTableContent = (
        <TableContainer
            sx={{
                maxWidth: "100%",
                width: "auto",
                height: "inherit",
                overflowY: "auto",
            }}
            component={Paper}
        >
            <Table size="small" stickyHeader aria-label="amr-table">
                <TableHead>
                    <TableRow>
                        {substanceTableHeader}
                        {props.resistancesTableData.tableHeader
                            .slice(nrOfSubstanceHeaderCells)
                            .map((headerValue) => (
                                <TableCell
                                    key={`header-amr-${headerValue}`}
                                    css={tableTextStyle}
                                    component="th"
                                    colSpan={3}
                                    align="center"
                                >
                                    {headerValue}
                                </TableCell>
                            ))}
                    </TableRow>
                    <TableRow>
                        {spacingCells}
                        {tableSubHeader}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.resistancesTableData.tableRows.map((row) => (
                        <TableRow key={`amr-table-row-${row.amrSubstance}`}>
                            {createTableRowCells(row)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const amrTableCancelButton: DialogButton = {
        content: t("Methods.Amrs.CancelButton"),
        onClick: handleClose,
    };
    const amrTableSubmitButton: DialogButton = {
        content: t("Methods.Amrs.ExportButton"),
        onClick: handleSubmit,
    };

    return DialogComponent({
        loading: false,
        dialogTitle: props.resistancesTableData.title,
        dialogContentText: props.resistancesTableData.description,
        dialogContent: dialogTableContent,
        cancelButton: amrTableCancelButton,
        submitButton: amrTableSubmitButton,
    });
}
