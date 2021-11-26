/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

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

/**
 * @desc Returns TableContainer for the results
 * @param tableData - list of objects with the counted isolates
 * @param columnAttributes - column attributes for the table header
 * @returns {JSX.Element} - table container component
 */
export function TableContentLayout(props: {
    tableHeader: JSX.Element[];
    tableRows: JSX.Element[];
}): JSX.Element {
    return (
        <TableContainer component={Paper} css={tableContainerStyle}>
            <Table stickyHeader aria-label="statistic table">
                <TableHead css={headerStyle}>
                    <TableRow css={headerStyle}>{props.tableHeader}</TableRow>
                </TableHead>
                <TableBody>{props.tableRows}</TableBody>
            </Table>
        </TableContainer>
    );
}
