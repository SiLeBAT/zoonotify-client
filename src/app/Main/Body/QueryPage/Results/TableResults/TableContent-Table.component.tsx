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

interface TableProps {
    allIsolates: Record<string, string>[];
    columnAttributes: string[];
    getSize: (
        node: HTMLElement | null,
        key: "height" | "totalWidth" | "partWidth"
    ) => void;
    isRowNotCol: boolean;
    isRowAndCol: boolean;
}

/**
 * @desc Returns TableContainer for the results
 * @param {Record<string, string>[]} allIsolates - list of objects with the counted isolates
 * @param {string[]} columnAttributes - column attributes for the table header
 * @param {(node: HTMLElement | null, key: "height" | "totalWidth" | "partWidth") => void} getSize - callback function to get the size of the header for the position of the main header
 * @param {boolean} isRowNotCol - true if row and no column is selected
 * @param {boolean} isRowAndCol - true if row and column is selected
 * @returns {JSX.Element} - table container component
 */
export function TableContentTableComponent(
    props: TableProps
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
