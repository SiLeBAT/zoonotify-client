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
import { TableContentRowsComponent as TableRows } from "./TableContent-Rows.component";
import { TableContentHeaderComponent as TableHeader } from "./TableContent-Header.component";
import { onBackgroundColor } from "../../../../../Shared/Style/Style-MainTheme.component";

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

export function TableContentTableComponent(
    props: ResultTableProps
): JSX.Element {
    const classes = useStyles();

    return (
        <TableContainer component={Paper} css={tableStyle}>
            <Table stickyHeader aria-label="simple table" css={tableStyle}>
                <TableHead>
                    <TableRow>
                        {TableHeader({
                            headerValues: props.columnAttributes,
                            getSize: props.getSize,
                            isRowNotCol: props.isRowNotCol,
                            isRowAndCol: props.isRowAndCol,
                            style: tabelCellStyle,
                        })}
                    </TableRow>
                </TableHead>
                <TableBody
                    ref={(node: HTMLElement | null) =>
                        props.getSize(node, "height")
                    }
                >
                    {props.allIsolates.map((row) => (
                        <TableRow key={`row-${row.name}`}>
                            {TableRows({
                                row,
                                classes,
                                isRowAndCol: props.isRowAndCol,
                                style: tabelCellStyle,
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
