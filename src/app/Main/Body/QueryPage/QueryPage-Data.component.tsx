/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import {
    withStyles,
    /* Theme, */
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
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { primaryColor, onBackgroundColor } from "../../../Shared/Style/Style-MainTheme.component";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { DataContext } from "../../../Shared/Context/DataContext";


const dataStyle = css`
    box-sizing: inherit;
    width: fit-content;
    margin-left: 2em;
`;

const tableStyle = css`
    box-sizing: inherit;
`;

const useStyles = makeStyles({
    tableCell: {
        wordWrap: "break-word",
        textAlign: "center",
        padding: "0.75em",
        color: onBackgroundColor
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
    }))(TableCell);

export function QueryPageTableComponent(): JSX.Element {
    const classes = useStyles();
    const { filter } = useContext(FilterContext);
    const { data } = useContext(DataContext);
    const { t } = useTranslation(["QueryPage"]);
    let filterData = [];

    if (filter.filterValue !== "") {
        filterData = _.filter(data.ZNData, { Serovar: filter.filterValue });
    } else {
        filterData = data.ZNData;
    }

    const isolates = Object.keys(filterData).length;

    return (
        <div css={dataStyle}>
            <TableContainer component={Paper} css={tableStyle}>
                <Table stickyHeader aria-label="simple table">
                    <TableHead>
                        <TableRow key="headerRow">
                            <StyledTableCell>{t("Results.TableHead")}</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow key="NrOf">
                            <TableCell
                                key="isolates"
                                className={classes.tableCell}
                                component="th"
                                scope="row"
                            >
                                {isolates}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
