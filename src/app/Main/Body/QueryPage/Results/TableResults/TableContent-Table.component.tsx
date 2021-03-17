/** @jsx jsx */
import { css, jsx } from "@emotion/core";
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
 * @param {Record<string, string>[]} tableData - list of objects with the counted isolates
 * @param {string[]} columnAttributes - column attributes for the table header
 * @returns {JSX.Element} - table container component
 */
export function TableContentTableComponent(props: {
    tableData: Record<string, string>[];
    columnAttributes: string[];
}): JSX.Element {
    const classes = useStyles();

    return (
        <TableContainer component={Paper} css={tableContainerStyle}>
            <Table stickyHeader aria-label="statistic table">
                <TableHead css={headerStyle}>
                    <TableRow css={headerStyle}>
                        {TableContentHeaderComponent(props.columnAttributes)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.tableData.map((row) => (
                        <TableRow key={`row-${row.name}`}>
                            {TableContentRowsComponent({
                                row,
                                classes,
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
