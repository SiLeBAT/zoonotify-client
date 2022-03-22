import React from "react";
import TableCell from "@mui/material/TableCell";
import { useTranslation } from "react-i18next";
import { DisplayOptionType } from "../../../../../../../Shared/Context/DataContext";
import { onBackgroundColor } from "../../../../../../../Shared/Style/Style-MainTheme";
import {
    highlightedTableBorder,
    fixedCellSizeRowValue,
    defaultTableBorder,
    sumRowColBackgroundColor,
    fixedCellSizeIcon,
} from "../ResultsTable.style";
import { getMicroorganismLabelService } from "../../../../Services/getMicroorganismLabel";

const emptyCellStyleIcon = {
    padding: "0.75em",
    color: onBackgroundColor,
    borderBottom: highlightedTableBorder,
    letterSpacing: 0,
    boxSizing: "border-box",
    borderRight: defaultTableBorder,
    width: `${fixedCellSizeIcon}px`,
    minWidth: `${fixedCellSizeIcon}px`,
} as const;

const emptyCellStyle = {
    padding: "0.75em",
    color: onBackgroundColor,
    borderBottom: highlightedTableBorder,
    letterSpacing: 0,
    boxSizing: "border-box",
    borderRight: `${defaultTableBorder}`,
    width: `${fixedCellSizeRowValue}px`,
    minWidth: `${fixedCellSizeRowValue}px`,
} as const;

const cellStyle = {
    padding: "0.75em",
    color: onBackgroundColor,
    borderBottom: highlightedTableBorder,
    letterSpacing: 0,
    boxSizing: "border-box",
    borderRight: defaultTableBorder,
    textAlign: "right",
    whiteSpace: "nowrap",
} as const;

const sumCellStyle = {
    padding: "0.75em",
    color: onBackgroundColor,
    letterSpacing: 0,
    boxSizing: "border-box",
    borderRight: defaultTableBorder,
    borderLeft: highlightedTableBorder,
    borderBottom: highlightedTableBorder,
    backgroundColor: sumRowColBackgroundColor,
    textAlign: "left",
    whiteSpace: "nowrap",
} as const;

/**
 * @desc Returns list of table cells for the table header
 * @param headerValues - object with two booleans, true if row/column is selected
 * @returns {JSX.Element[]} - list of table cell components
 */
export function createTableHeaderService(props: {
    showRowSum: boolean;
    headerValues: string[];
    colAttribute: string;
    tableOption: DisplayOptionType;
    isCol: boolean;
    isSubFilter: boolean;
}): JSX.Element[][] {
    const { t } = useTranslation(["QueryPage"]);
    const headerTableCells: JSX.Element[] = [];

    if (props.isSubFilter) {
        headerTableCells.push(
            <TableCell sx={emptyCellStyleIcon} key="header-blank">
                &nbsp;
            </TableCell>
        );
    }

    headerTableCells.push(
        <TableCell sx={emptyCellStyle} key="header-blank2">
            &nbsp;
        </TableCell>
    );
    const headerValueCells: JSX.Element[] = [];
    props.headerValues.forEach((headerValue): void => {
        let headerTitle: string | JSX.Element = "";
        if (props.isCol) {
            const colKey = headerValue.replace(".", "");
            if (props.colAttribute === "microorganism") {
                const translateRootString = `FilterValues.formattedMicroorganisms.${colKey}`;
                const prefix = t(`${translateRootString}.prefix`);
                const name = t(`${translateRootString}.name`);
                const italicName = t(`${translateRootString}.italicName`);
                const suffix = t(`${translateRootString}.suffix`);
                headerTitle = getMicroorganismLabelService({
                    prefix,
                    name,
                    italicName,
                    suffix,
                });
            } else {
                headerTitle = t(`FilterValues.${props.colAttribute}.${colKey}`);
            }
            if (props.tableOption === "relative") {
                headerTitle = (
                    <span>
                        {headerTitle} {t("Results.Unit")}
                    </span>
                );
            }
        } else if (props.tableOption === "relative") {
            headerTitle = `${t("Results.NrIsolatesTextRelative")} ${t(
                "Results.Unit"
            )}`;
        } else if (props.tableOption === "absolute") {
            headerTitle = t("Results.NrIsolatesText");
        }

        const headerCell = (
            <TableCell sx={cellStyle} key={`header-${headerValue}`}>
                {headerTitle}
            </TableCell>
        );

        headerValueCells.push(headerCell);
        headerTableCells.push(headerCell);
    });

    if (props.showRowSum) {
        headerTableCells.push(
            <TableCell sx={sumCellStyle} key="header-row-sum">
                {t("Sums.RowSum")}
            </TableCell>
        );
    }
    return [headerTableCells, headerValueCells];
}
