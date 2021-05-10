/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import {
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ExportButtonLabelComponent } from "../../../../Shared/Export-ButtonLabel.component";
import { DialogComponent } from "../../../../Shared/Dialog.component";
import { TableData } from "../InfoPage.model";
import { AmrsTableData } from "./createAmrsTableData.service";

const tableDivStyle = css`
    margin: 1em;
    height: inherit;
    overflow-y: auto;
`;
const tableContainerStyle = css`
    height: 100%;
`;

const tableTextStyle = css`
    font-size: 0.5rem;
    letter-spacing: 0;
    white-space: nowrap;
`;

const starTextStyle = css`
    margin-left: 1em;
    font-size: 0.5rem;
    letter-spacing: 0;
`;

const useStyles = makeStyles({
    table: {
        minWidth: 550,
    },
});

function tableRowCellList(row: AmrsTableData): JSX.Element[] {
    const tableCellList: JSX.Element[] = [];
    Object.keys(row).forEach((rowKey) => {
        tableCellList.push(
            <TableCell
                css={tableTextStyle}
                component="th"
                scope="row"
                key={`amr-table-cell-${row.name}-${rowKey}`}
            >
                {row[rowKey]}
            </TableCell>
        );
    });
    return tableCellList;
}

export function InfoPageAmrDialogComponent(props: {
    resistancesTableData: TableData;
    infoPageTableDialogIsOpen: boolean;
    onClose: () => void;
    onAmrDataExport: () => void;
}): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);
    const classes = useStyles();

    const handleClose = (): void => {
        props.onClose();
    };

    const handleSubmit = (): void => {
        props.onAmrDataExport();
    };

    const dialogTableContent = (
        <div css={tableDivStyle}>
            <TableContainer css={tableContainerStyle} component={Paper}>
                <Table
                    className={classes.table}
                    size="small"
                    stickyHeader
                    aria-label="amr-table"
                >
                    <TableHead>
                        <TableRow>
                            {props.resistancesTableData.tableHeader.map(
                                (headerValue) => (
                                    <TableCell
                                        key={`header-amr-${headerValue}`}
                                        css={tableTextStyle}
                                    >
                                        {headerValue}
                                    </TableCell>
                                )
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.resistancesTableData.tableRows.map((row) => (
                            <TableRow key={`amr-table-row-${row.name}`}>
                                {tableRowCellList(row)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <p css={starTextStyle}>
                    {props.resistancesTableData.commentText}
                </p>
            </TableContainer>
        </div>
    ); 

    const amrTableCancelButton = t("Methods.Amrs.CancelButton");
    const amrTableSubmitButton = ExportButtonLabelComponent(false);

    return DialogComponent({
        isOpen: props.infoPageTableDialogIsOpen,
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
