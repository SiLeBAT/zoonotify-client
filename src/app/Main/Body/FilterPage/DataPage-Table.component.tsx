/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import {
    withStyles,
    Theme,
    createStyles,
    makeStyles,
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import * as _ from "lodash";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";
import { DBentry, DBtype } from "../../../Shared/Isolat.model";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { DataContext } from "../../../Shared/Context/DataContext";

const dataStyle = css`
    box-sizing: inherit;
`;

const tableStyle = css`
    height: 750px;
    overflow: scroll;
    box-sizing: inherit;
`;

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    tableCell: {
        wordWrap: "break-word",
    },
});

const StyledTableCell = withStyles((theme: Theme) =>
    createStyles({
        head: {
            backgroundColor: primaryColor,
            color: theme.palette.common.white,
        },
        body: {
            fontSize: 14,
        },
    })
)(TableCell);

export function DataPageTableComponent(): JSX.Element {
    const classes = useStyles();
    const { filter } = useContext(FilterContext);
    const { data } = useContext(DataContext);
    let filterData = [];

    if (filter.filterValue !== "") {
        filterData = _.filter(data.data, { Serovar: filter.filterValue });
    } else {
        filterData = data.data;
    }

    return (
        <div css={dataStyle}>
        <TableContainer component={Paper} css={tableStyle}>
            <Table
                stickyHeader
                className={classes.table}
                aria-label="simple table"
            >
                <TableHead>
                    <TableRow key="headerRow">
                        {data.keyValues.map((keyValue: DBtype) => (
                            <StyledTableCell key={`headerRow_${keyValue}`}>
                                {keyValue}
                            </StyledTableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filterData.map((post: DBentry) => {
                        const id = post.uniqueId;
                        return (
                            <TableRow key={id}>
                                {data.keyValues.map((keyValue: DBtype) => (
                                    <TableCell
                                        key={`${id}_${keyValue}`}
                                        className={classes.tableCell}
                                        component="th"
                                        scope="row"
                                    >
                                        {post[keyValue]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
        </div>
    );
}
