/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext, useEffect, useState } from "react";
import { withStyles, createStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import _ from "lodash";
import {
    primaryColor,
    onBackgroundColor,
    onPrimaryColor,
} from "../../../Shared/Style/Style-MainTheme.component";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { DataContext } from "../../../Shared/Context/DataContext";
import { TableContext } from "../../../Shared/Context/TableContext";
import { FilterType } from "../../../Shared/Filter.model";

const dataStyle = css`
    box-sizing: inherit;
    width: fit-content;
    margin-left: 2em;
`;
const tableRowHeader = css`
    margin: 0;
    display: flex;
    justify-content: center;
    transform: rotate(180deg);
    writing-mode: vertical-lr;
    font-weight: normal;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
`;
const tableColumnHeader = css`
    margin: 0;
    display: flex;
    justify-content: center;
    font-weight: normal;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
`;
const tableDivStyle = css`
    display: flex;
    flex-direction: row;
`;

const tableStyle = css`
    box-sizing: inherit;
    min-height: 110px;
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

export function QueryPageTableRestultComponent(): JSX.Element {
    const [columnAttributes, setColumnAttributes] = useState<string[]>([]);
    const [allIsolates, setAllIsolates] = useState<Record<string, string>[]>(
        []
    );
    const { filter } = useContext(FilterContext);
    const { data } = useContext(DataContext);
    const { table } = useContext(TableContext);
    const classes = useStyles();

    const rowAttribute: FilterType = table.row;
    const colAttribute: FilterType = table.column;

    const countIsolates = (colValue: string, rowValue: string): string => {
        return (_.filter(data.ZNData, {
            [colAttribute]: colValue,
            [rowAttribute]: rowValue,
        }).length as unknown) as string;
    };

    const getAllIsolates = async (): Promise<void> => {
        setAllIsolates([]);
        const newIsolates: Record<string, string>[] = [];
        let rowValues = data.uniqueValues[rowAttribute];
        if (!_.isEmpty(filter[rowAttribute])) {
            rowValues = filter[rowAttribute];
        }
        let colValues = data.uniqueValues[colAttribute];
        if (!_.isEmpty(filter[colAttribute])) {
            colValues = filter[colAttribute];
        }
        rowValues.forEach((rowValue) => {
            const isolates: Record<string, string> = { name: rowValue };
            colValues.forEach((colValue) => {
                const count = countIsolates(colValue, rowValue);
                isolates[colValue] = count;
            });
            newIsolates.push(isolates);
        });
        setAllIsolates(newIsolates);
        setColumnAttributes(colValues);
    };

    useEffect((): void => {
        getAllIsolates();
    }, [filter, table]);

    return (
        <div css={dataStyle}>
            <h4 css={tableColumnHeader}>{colAttribute}</h4>
            <div css={tableDivStyle}>
                <h4 css={tableRowHeader}>{rowAttribute}</h4>
                <TableContainer component={Paper} css={tableStyle}>
                    <Table stickyHeader aria-label="simple table" css={tableStyle}>
                        <TableHead>
                            <TableRow key="headerRow">
                                <StyledTableCell key="header-blank">
                                    &nbsp;
                                </StyledTableCell>
                                {(function AddHeader(): JSX.Element[] {
                                    const elements: JSX.Element[] = [];
                                    columnAttributes.forEach(
                                        (element): void => {
                                            elements.push(
                                                <StyledTableCell
                                                    key={`header-${element}`}
                                                >
                                                    {element}
                                                </StyledTableCell>
                                            );
                                        });
                                    return elements;
                                })()}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allIsolates.map((row) => (
                                <TableRow key={`row-${row.name}`}>
                                    {(function AddIsolates(): JSX.Element[] {
                                        const elements: JSX.Element[] = [];
                                        const k = Object.keys(row);
                                        k.forEach((element): void => {
                                            elements.push(
                                                <TableCell
                                                    key={`isolates-${row.name}-${element}`}
                                                    className={
                                                        classes.tableCell
                                                    }
                                                    component="th"
                                                    scope="row"
                                                    align="right"
                                                >
                                                    {row[element]}
                                                </TableCell>
                                            );
                                        });
                                        return elements;
                                    })()}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
}
