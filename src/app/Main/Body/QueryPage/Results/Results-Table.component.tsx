/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { RowValues } from "./Results-TableRows.component";
import { Header } from "./Results-TableHeader.component";
import { onBackgroundColor } from "../../../../Shared/Style/Style-MainTheme.component";

const tableStyle = css`
    box-sizing: inherit;
    min-height: 110px;
    width: fit-content;
    min-width: 20em;
`;
const tabelCellStyle = (
    isRow: boolean,
    isRowAndCol: boolean
): SerializedStyles => css`
    box-sizing: border-box;
    border-right: 1px solid lightgrey;
    :last-child {
        border-right: ${isRowAndCol ? `1px solid lightgrey` : "none"};
    }
    text-align: right;
    white-space: ${isRow ? "nowrap" : "normal"};
`;

const useStyles = makeStyles({
    tableCell: {
        wordWrap: "break-word",
        padding: "0.75em",
        color: onBackgroundColor,
        letterSpacing: 0,
    },
});

interface ResultTableProps {
    allIsolates: Record<string, string>[];
    columnAttributes: string[];
    getSize: (
        node: HTMLElement | null,
        key: "height" | "totalWidth" | "partWidth"
    ) => void;
    isRowNotCol: boolean;
    isRowAndCol: boolean;
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
                            props.getSize,
                            props.isRowNotCol,
                            props.isRowAndCol,
                            tabelCellStyle
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
                            {RowValues(
                                row,
                                classes,
                                props.isRowAndCol,
                                tabelCellStyle
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
