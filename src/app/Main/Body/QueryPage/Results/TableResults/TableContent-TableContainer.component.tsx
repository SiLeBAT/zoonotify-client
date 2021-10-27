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
import { DisplayOptionType } from "../../../../../Shared/Context/DataContext";
import { SumOptions } from "./TableResults.model";

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
export function TableContentTableContainerComponent(props: {
    sumOptions: SumOptions;
    numberOfIsolates: number;
    tableData: Record<string, string>[];
    displayOption: DisplayOptionType;
    columnNameValues: string[];
    colAttribute: string;
    rowAttribute: string;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const classes = useStyles();

    const isCol = props.colAttribute !== "";
    const isRow = props.rowAttribute !== "";

    const tableRows: JSX.Element[] = props.tableData
        .filter((row) => row.name !== "colSum")
        .map((row) => (
            <TableRow key={`row-${row.name}`}>
                {TableContentRowsComponent({
                    showRowSum: props.sumOptions.showRowSum,
                    row,
                    rowAttribute: props.rowAttribute,
                    displayRow: isRow,
                    classes,
                    displayOption: props.displayOption,
                    colKeys: props.columnNameValues,
                })}
            </TableRow>
        ));

    if (props.sumOptions.showColSum) {
        const rowWithColSums = props.tableData.filter((row) => row.name === "colSum")[0]

        tableRows.push(
            <TableRow key="row-with-column-sum">
                {TableContentRowWithColSumComponent({
                    showRowSum: props.sumOptions.showRowSum,
                    numberOfIsolates: props.numberOfIsolates,
                    rowWithColSums,
                    headerValues: props.columnNameValues,
                    classes,
                    colSumLabel: t("Sums.ColSum"),
                    displayOption: props.displayOption,
                })}
            </TableRow>
        );
    }

    return (
        <TableContainer component={Paper} css={tableContainerStyle}>
            <Table stickyHeader aria-label="statistic table">
                <TableHead css={headerStyle}>
                    <TableRow css={headerStyle}>
                        {TableContentHeaderComponent({
                            showRowSum: props.sumOptions.showRowSum,
                            headerValues: props.columnNameValues,
                            colAttribute: props.colAttribute,
                            tableOption: props.displayOption,
                            isCol,
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>{tableRows}</TableBody>
            </Table>
        </TableContainer>
    );
}
