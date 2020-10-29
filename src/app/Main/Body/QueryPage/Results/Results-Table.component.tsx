/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import {
    makeStyles,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@material-ui/core";
import { RowValues } from "./Results-TableRows.component";
import { Header } from "./Results-TableHeader.component";
import { onBackgroundColor } from "../../../../Shared/Style/Style-MainTheme.component";

const tableStyle = css`
    box-sizing: inherit;
    min-height: 110px;
    width: fit-content;
    min-width: 20em;
`;

const useStyles = makeStyles({
    tableCell: {
        wordWrap: "break-word",
        padding: "0.75em",
        color: onBackgroundColor,
    },
});

interface ResultTableProps {
    allIsolates: Record<string, string>[];
    isIsolates: boolean;
    columnAttributes: string[];
    getSize: (
        node: HTMLElement | null,
        key: "height" | "totalWidth" | "partWidth"
    ) => void;
}

export function ResultsTableComponent(props: ResultTableProps): JSX.Element {
    const classes = useStyles();

    return (
        <TableContainer component={Paper} css={tableStyle}>
            <Table stickyHeader aria-label="simple table" css={tableStyle}>
                <TableHead>
                    <TableRow key="headerRow">
                        {Header(
                            props.columnAttributes,
                            props.isIsolates,
                            props.getSize
                        )}
                    </TableRow>
                </TableHead>
                <TableBody
                    ref={(node: HTMLElement | null) =>
                        props.getSize(node, "height")
                    }
                >
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
