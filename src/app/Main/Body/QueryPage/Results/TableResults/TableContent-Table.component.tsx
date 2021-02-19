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

export interface TableProps {
    tableData: Record<string, string>[];
    columnAttributes: string[];
    isRowAndCol: boolean;
}

/**
 * @desc Returns TableContainer for the results
 * @param {Record<string, string>[]} allIsolates - list of objects with the counted isolates
 * @param {string[]} columnAttributes - column attributes for the table header
 * @param {boolean} isRowAndCol - true if row and column is selected
 * @returns {JSX.Element} - table container component
 */
export function TableContentTableComponent(props: TableProps): JSX.Element {
    const classes = useStyles();

    return (
        <TableContainer component={Paper} css={tableContainerStyle}>
            <Table stickyHeader aria-label="statistic table" >
                <TableHead css={headerStyle}>
                    <TableRow css={headerStyle}>
                        {TableContentHeaderComponent({
                            headerValues: props.columnAttributes,
                            isRowAndCol: props.isRowAndCol,
                        })}
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
