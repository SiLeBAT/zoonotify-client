/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import {
    makeStyles,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    withStyles,
    createStyles,
    TableCell,
} from "@material-ui/core";
import { RowValues } from "./Results-TableRows.component";
import { Header } from "./Results-TableHeader.component";
import {
    onBackgroundColor,
    primaryColor,
} from "../../../../Shared/Style/Style-MainTheme.component";

const tableStyle = css`
    box-sizing: inherit;
    min-height: 110px;
`;
const tableHeaderStyle = (isIsolates: boolean): SerializedStyles => css`
    display: ${isIsolates ? "none" : "auto"};
`;

const useStyles = makeStyles({
    tableCell: {
        wordWrap: "break-word",
        padding: "0.75em",
        color: onBackgroundColor,
    },
});

const StyledTableCell = withStyles(() =>
    createStyles({
        head: {
            padding: "0.75em",
            color: onBackgroundColor,
            borderBottom: `1px solid ${primaryColor}`,
        },
        body: {
            color: onBackgroundColor,
            fontSize: 14,
        },
    })
)(TableCell);

interface ResultTableProps {
    columnAttributes: string[];
    allIsolates: Record<string, string>[];
}

export function ResultsTableComponent(props: ResultTableProps): JSX.Element {
    const classes = useStyles();

    // große Tabelle
    let isIsolates = false;
    if (props.columnAttributes[0] === "all isolates") {
        isIsolates = true;
    }

    return (
        <TableContainer component={Paper} css={tableStyle}>
            <Table stickyHeader aria-label="simple table" css={tableStyle}>
                <TableHead>
                    <TableRow key="headerRow">
                        <StyledTableCell
                            key="header-blank"
                            css={tableHeaderStyle(isIsolates)}
                        >
                            &nbsp;
                        </StyledTableCell>
                        {Header(props.columnAttributes)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.allIsolates.map((row) => (
                        <TableRow key={`row-${row.name}`}>
                            {RowValues(row, classes)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
