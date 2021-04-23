/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TableContentRowsComponent } from "./TableContent-Rows.component";
import { TableContentHeaderComponent } from "./TableContent-Header.component";
import { onBackgroundColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import { TableContentRowWithColSumComponent } from "./TableContent-RowWithColSums.component";

const headerStyle = css`
    height: 50px;
`;
const tableContainerStyle = css`
    box-sizing: border-box;
    min-width: 20em;
    box-shadow: none;
    border-radius: unset;
    height: 100%;
`;

const useStyles = makeStyles({
    tableCell: {
        wordWrap: "break-word",
        padding: "0.75em",
        color: onBackgroundColor,
        letterSpacing: 0,
    },
});

/**
 * @desc Returns TableContainer for the results
 * @param tableData - list of objects with the counted isolates
 * @param columnAttributes - column attributes for the table header
 * @returns {JSX.Element} - table container component
 */
export function TableContentTableComponent(props: {
    isSumRowCol: boolean;
    tableData: Record<string, string>[];
    columnNameValues: string[];
    displayOption: string;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const classes = useStyles();

    const tableRows: JSX.Element[] = props.tableData.map((row) => (
        <TableRow key={`row-${row.name}`}>
            {TableContentRowsComponent({
                isSumRowCol: props.isSumRowCol,
                row,
                classes,
                displayOption: props.displayOption
            })}
        </TableRow>
    ));

    if (props.isSumRowCol) {
        tableRows.push(
            <TableRow key="row-with-column-sum">
                {TableContentRowWithColSumComponent({
                    tableData: props.tableData,
                    headerValues: props.columnNameValues,
                    classes,
                    colSumLabel: t("Sums.ColSum"),
                    displayOption: props.displayOption
                })}
            </TableRow>
        );
    }

    return (
        <TableContainer component={Paper} css={tableContainerStyle}>
            <Table stickyHeader aria-label="statistic table">
                <TableHead css={headerStyle}>
                    <TableRow css={headerStyle}>
                        {TableContentHeaderComponent(
                            props.isSumRowCol,
                            props.columnNameValues
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>{tableRows}</TableBody>
            </Table>
        </TableContainer>
    );
}
