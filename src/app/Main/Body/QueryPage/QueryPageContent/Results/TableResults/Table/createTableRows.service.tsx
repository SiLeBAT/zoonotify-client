/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import { TableRow } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { getMicroorganismLabelService } from "../../../../Services/getMicroorganismLabel";
import {
    DisplayOptionType,
    SubFilterDataType,
} from "../../../../../../../Shared/Context/DataContext";
import {
    defaultTableBorder,
    fixedCellSizeIcon,
    fixedCellSizeRowValue,
    highlightedTableBorder,
    sumRowColBackgroundColor,
} from "../ResultsTable.style";
import { subTableComponent } from "./subTable.component";

const tableCellStyle = (isName: boolean): SerializedStyles => css`
    box-sizing: border-box;
    border-right: ${defaultTableBorder};
    width: ${isName ? `${fixedCellSizeRowValue}px` : "auto"};
    min-width: ${isName ? `${fixedCellSizeRowValue}px` : "auto"};
`;
const tableCellStyleIcon = css`
    box-sizing: border-box;
    border-right: ${defaultTableBorder};
    padding: 0em;
    width: ${`${fixedCellSizeIcon}px`};
    min-width: ${`${fixedCellSizeIcon}px`};
`;
const sumTableCellStyle = css`
    box-sizing: border-box;
    border-right: ${defaultTableBorder};
    border-left: ${highlightedTableBorder};
    background-color: ${sumRowColBackgroundColor};
`;

/**
 * @desc Returns list of table cells for one table row
 * @param row - object with the values for the row
 * @param classes - material-ui styling of one table cell
 * @returns {JSX.Element} - list of table cell components
 */
export function createTableRowsService(props: {
    showRowSum: boolean;
    row: Record<string, string>;
    rowAttribute: string;
    displayRow: boolean;
    displayOption: DisplayOptionType;
    colKeys: string[];
    style: Record<string, string | number>;
    tableHeader: JSX.Element[];
    subTableData: SubFilterDataType;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const [subTableIsOpen, setSubTableIsOpen] = useState<boolean>(false);
    const handleOpenSubTable = (): void => setSubTableIsOpen(!subTableIsOpen);

    const isSubFilterTable = Object.keys(props.subTableData).includes(
        props.row.name
    );

    let subTable: JSX.Element | undefined;

    if (isSubFilterTable) {
        subTable = subTableComponent({
            rowName: props.row.name,
            tableHeader: props.tableHeader,
            subTableIsOpen,
            subTableData: props.subTableData,
            t,
        });
    }

    let rowName: string | JSX.Element = "";
    const rowKey = props.row.name.replace(".", "");
    if (props.displayRow) {
        if (props.rowAttribute === "microorganism") {
            const translateRootString = `FilterValues.formattedMicroorganisms.${rowKey}`;
            const prefix = t(`${translateRootString}.prefix`);
            const name = t(`${translateRootString}.name`);
            const italicName = t(`${translateRootString}.italicName`);
            const suffix = t(`${translateRootString}.suffix`);
            rowName = getMicroorganismLabelService({
                prefix,
                name,
                italicName,
                suffix,
            });
        } else {
            rowName = t(`FilterValues.${props.rowAttribute}.${rowKey}`);
        }
    } else if (props.displayOption === "relative") {
        rowName = `${t("Results.NrIsolatesTextRelative")} ${t("Results.Unit")}`;
    } else if (props.displayOption === "absolute") {
        rowName = t("Results.NrIsolatesText");
    }

    const rowCells: JSX.Element[] = [];

    if (props.rowAttribute === "microorganism") {
        if (isSubFilterTable) {
            rowCells.push(
                <TableCell
                    key={`iconButtonCell-${props.row.name}`}
                    sx={props.style}
                    component="th"
                    scope="row"
                    align="left"
                    css={tableCellStyleIcon}
                >
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={handleOpenSubTable}
                    >
                        {subTableIsOpen ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </IconButton>
                </TableCell>
            );
        } else {
            rowCells.push(
                <TableCell
                    key={`iconButtonCell-${props.row.name}`}
                    sx={props.style}
                    component="th"
                    scope="row"
                    align="left"
                    css={tableCellStyleIcon}
                >
                    &nbsp;
                </TableCell>
            );
        }
    }

    rowCells.push(
        <TableCell
            key={`isolates-${props.row.name}-name`}
            sx={props.style}
            component="th"
            scope="row"
            align="left"
            css={tableCellStyle(true)}
        >
            {rowName}
        </TableCell>
    );
    props.colKeys.forEach((colKey): void => {
        const cellNumber = props.row[colKey];
        rowCells.push(
            <TableCell
                key={`isolates-${props.row.name}-${colKey}`}
                sx={props.style}
                component="th"
                scope="row"
                align="right"
                css={tableCellStyle(false)}
            >
                {cellNumber}
            </TableCell>
        );
    });

    if (props.showRowSum) {
        rowCells.push(
            <TableCell
                key="isolates-row-sum"
                sx={props.style}
                component="th"
                scope="row"
                align="right"
                css={sumTableCellStyle}
            >
                {props.row.rowSum}
            </TableCell>
        );
    }

    return (
        <React.Fragment key={`row-subTable-${props.row.name}`}>
            <TableRow key={`row-main-${props.row.name}`}>{rowCells}</TableRow>
            {isSubFilterTable && subTable}
        </React.Fragment>
    );
}
