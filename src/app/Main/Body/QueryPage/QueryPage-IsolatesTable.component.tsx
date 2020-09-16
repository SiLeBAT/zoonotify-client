/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext, useState, useEffect } from "react";
import { withStyles, createStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import {
    primaryColor,
    onBackgroundColor,
} from "../../../Shared/Style/Style-MainTheme.component";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { DataContext } from "../../../Shared/Context/DataContext";
import { DBentry } from "../../../Shared/Isolat.model";
import { FilterType, mainFilterAttributes } from "../../../Shared/Filter.model";

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

export function QueryPageTableComponent(): JSX.Element {
    const [isolates, setIsolates] = useState<number>();
    const classes = useStyles();
    const { filter } = useContext(FilterContext);
    const { data, setData } = useContext(DataContext);
    const { t } = useTranslation(["QueryPage"]);
    let filterData: DBentry[] = [];

    const useFilter = (): void => {
        let filteredData: DBentry[] = data.ZNData;
        mainFilterAttributes.map(async (attribute: FilterType) => {
            if (!_.isEmpty(filter[attribute])) {
                let tempFilteredData: DBentry[] = [];
                filter[attribute].forEach((element) => {
                    tempFilteredData = tempFilteredData.concat(
                        _.filter(filteredData, {
                            [attribute]: element,
                        })
                    );
                });
                filteredData = tempFilteredData;
            }
        });
        setData({ ...data, ZNDataFiltered: filteredData });
        setIsolates(Object.keys(filteredData).length);
    };

    const noFilter = mainFilterAttributes.every(function emptyArray(
        key
    ): boolean {
        const empty: boolean = _.isEmpty(filter[key]);
        return empty;
    });

    useEffect((): void => {
        if (noFilter) {
            filterData = data.ZNData;
            setData({ ...data, ZNDataFiltered: data.ZNData });
            setIsolates(Object.keys(filterData).length);
        } else {
            useFilter();
        }
    }, [filter]);

    return (
        <div css={dataStyle}>
            <TableContainer component={Paper} css={tableStyle}>
                <Table stickyHeader aria-label="simple table">
                    <TableHead>
                        <TableRow key="headerRow">
                            <StyledTableCell>
                                {t("Results.TableHead")}
                            </StyledTableCell>
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
