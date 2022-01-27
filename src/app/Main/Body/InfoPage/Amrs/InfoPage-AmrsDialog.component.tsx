/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { ButtonLabelComponent } from "../../../../Shared/ButtonLabel.component";
import {
    DialogButton,
    DialogComponent,
} from "../../../../Shared/Dialog.component";
import { AmrsTable, AmrsTableData } from "../InfoPage.model";

const dialogContentStyle = css`
    height: inherit;
    overflow-y: auto;
`;
const tableContainerStyle = css`
    height: 100%;
`;

const tableTextStyle = css`
    font-size: 0.75rem;
    letter-spacing: 0;
    white-space: nowrap;
`;

function createTableRowCells(row: AmrsTableData): JSX.Element[] {
    const tableCellList: JSX.Element[] = [];
    tableCellList.push(
        <TableCell
            css={tableTextStyle}
            component="td"
            scope="row"
            key={`amr-table-cell-${row.amrSubstance}-substanceClass`}
        >
            {row.substanceClass}
        </TableCell>
    );
    tableCellList.push(
        <TableCell
            css={tableTextStyle}
            component="td"
            scope="row"
            key={`amr-table-cell-${row.amrSubstance}-substance`}
        >
            {row.amrSubstance}
        </TableCell>
    );
    Object.keys(row.concentrationList).forEach((year) => {
        const concentrationPerYear = row.concentrationList[year];
        tableCellList.push(
            <TableCell
                css={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-${year}-cutOff`}
            >
                {concentrationPerYear.cutOff}
            </TableCell>
        );
        tableCellList.push(
            <TableCell
                css={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-${year}-min`}
            >
                {concentrationPerYear.min}
            </TableCell>
        );
        tableCellList.push(
            <TableCell
                css={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-${year}-max`}
            >
                {concentrationPerYear.max}
            </TableCell>
        );
    });
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

    Object.keys(props.resistancesTableData.tableSubHeader).forEach(
        (subHeaderKey) => {
            props.resistancesTableData.tableSubHeader[subHeaderKey].forEach(
                (subHeaderValue: string) => {
                    tableSubHeader.push(
                        <TableCell
                            key={`subheader-amr-${subHeaderKey}-${subHeaderValue}`}
                            css={tableTextStyle}
                            component="th"
                            align="right"
                        >
                            {subHeaderValue}
                        </TableCell>
                    );
                }
            );
        }
    );

    const dialogTableContent = (
        <div css={dialogContentStyle}>
            <TableContainer css={tableContainerStyle} component={Paper}>
                <Table size="small" stickyHeader aria-label="amr-table">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                key={`header-amr-${props.resistancesTableData.tableHeader[0]}`}
                                css={tableTextStyle}
                                component="th"
                                colSpan={1}
                            >
                                {props.resistancesTableData.tableHeader[0]}
                            </TableCell>
                            <TableCell
                                key={`header-amr-${props.resistancesTableData.tableHeader[1]}`}
                                css={tableTextStyle}
                                component="th"
                                colSpan={1}
                            >
                                {props.resistancesTableData.tableHeader[1]}
                            </TableCell>
                            {props.resistancesTableData.tableHeader
                                .slice(2)
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
                            <TableCell
                                key="header-amr-emptyCell-class"
                                css={tableTextStyle}
                                component="th"
                                align="right"
                            >
                                &nbsp;
                            </TableCell>
                            <TableCell
                                key="header-amr-emptyCell-substance"
                                css={tableTextStyle}
                                component="th"
                                align="right"
                            >
                                &nbsp;
                            </TableCell>
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
        </div>
    );

    const amrTableCancelButton: DialogButton = {
        content: t("Methods.Amrs.CancelButton"),
        onClick: handleClose,
    };
    const amrTableSubmitButton: DialogButton = {
        content: ButtonLabelComponent(t("Methods.Amrs.ExportButton"), true),
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
