import React from "react";
import { TFunction } from "i18next";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {
    Box,
    Collapse,
    Table,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { defaultTableBorder } from "../ResultsTable.style";
import { replaceAll } from "../../../../../../../Core/replaceAll.service";
import { SubFilterDataType } from "../../../../../../../Shared/Context/DataContext";

function translateRowName(
    subFilterName: string,
    name: string,
    t: TFunction
): string {
    const filterValueWithNoDot = replaceAll(name, ".", "-");
    const filterValueToTranslate = replaceAll(filterValueWithNoDot, ":", "");
    return t(`Subfilters.${subFilterName}.values.${filterValueToTranslate}`);
}

export function subTableComponent(props: {
    rowName: string;
    tableHeader: JSX.Element[];
    subTableIsOpen: boolean;
    subTableData: SubFilterDataType;
    t: TFunction;
}): JSX.Element {
    const { t } = props;

    const oneSubTable = props.subTableData[props.rowName].tableRows;

    const { subFilterName } = props.subTableData[props.rowName];
    const subTableSize = props.tableHeader.length + 1;

    const subFilterTable = (
        <TableRow key={`row-sub-${props.rowName}`}>
            {props.subTableIsOpen && <TableCell>&nbsp;</TableCell>}
            <TableCell style={{ padding: 0 }} colSpan={subTableSize}>
                <Collapse
                    in={props.subTableIsOpen}
                    timeout="auto"
                    unmountOnExit
                >
                    <Box sx={{ margin: 1 }}>
                        <Typography
                            variant="subtitle1"
                            gutterBottom
                            component="div"
                        >
                            {t(`Subfilters.${subFilterName}.name`)}
                        </Typography>
                        <Table size="small" aria-label="purchases">
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{ borderRight: defaultTableBorder }}
                                        scope="row"
                                    >
                                        &nbsp;
                                    </TableCell>
                                    {props.tableHeader}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {oneSubTable.map((row) => (
                                    <TableRow key={`subTableRow-${row.name}`}>
                                        <TableCell
                                            sx={{
                                                padding: 1,
                                                borderRight: defaultTableBorder,
                                            }}
                                            component="th"
                                            scope="row"
                                        >
                                            {translateRowName(
                                                subFilterName,
                                                row.name,
                                                t
                                            )}
                                        </TableCell>
                                        {Object.keys(row)
                                            .filter(
                                                (rowKey) => rowKey !== "name"
                                            )
                                            .map((rowKey, index) => (
                                                <TableCell
                                                    sx={{
                                                        padding: 1,
                                                        borderRight:
                                                            defaultTableBorder,
                                                    }}
                                                    align="right"
                                                    // eslint-disable-next-line react/no-array-index-key
                                                    key={`subTableRowCell-${row.name}-${index}`}
                                                >
                                                    {row[rowKey]}
                                                </TableCell>
                                            ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    );
    return subFilterTable;
}
