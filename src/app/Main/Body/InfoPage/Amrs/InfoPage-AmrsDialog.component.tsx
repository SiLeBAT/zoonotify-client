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
import { ExportButtonLabelComponent } from "../../../../Shared/Export-ButtonLabel.component";
import { DialogComponent } from "../../../../Shared/Dialog.component";
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
    Object.keys(row.valuesPerYearObject).forEach((year) => {
        const yearValues = row.valuesPerYearObject[year];
        tableCellList.push(
            <TableCell
                css={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-cutOff`}
            >
                {yearValues.cutOff}
            </TableCell>
        );
        tableCellList.push(
            <TableCell
                css={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-min`}
            >
                {yearValues.min}
            </TableCell>
        );
        tableCellList.push(
            <TableCell
                css={tableTextStyle}
                component="td"
                scope="row"
                align="right"
                key={`amr-table-cell-${row.amrSubstance}-max`}
            >
                {yearValues.max}
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
                            {props.resistancesTableData.tableSubHeader.map(
                                (subHeaderValue) => (
                                    <TableCell
                                        key={`header-amr-${subHeaderValue}`}
                                        css={tableTextStyle}
                                        component="th"
                                        align="right"
                                    >
                                        {subHeaderValue}
                                    </TableCell>
                                )
                            )}
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

    const amrTableCancelButton = t("Methods.Amrs.CancelButton");
    const amrTableSubmitButton = ExportButtonLabelComponent(true);

    return DialogComponent({
        loading: false,
        dialogTitle: props.resistancesTableData.title,
        dialogContentText: props.resistancesTableData.description,
        dialogContent: dialogTableContent,
        cancelButton: amrTableCancelButton,
        submitButton: amrTableSubmitButton,
        disableSubmitButton: false,
        onClose: handleClose,
        onSubmitClick: handleSubmit,
    });
}
