/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import TableCell from "@mui/material/TableCell";
import { useTranslation } from "react-i18next";
import { DisplayOptionType } from "../../../../../../../Shared/Context/DataContext";
import { onBackgroundColor } from "../../../../../../../Shared/Style/Style-MainTheme";
import {
    highlightedTableBorder,
    fixedCellSize,
    defaultTableBorder,
    sumRowColBackgroundColor,
} from "../ResultsTable.style";
import { getMicroorganismLabelService } from "../../../../Services/getMicroorganismLabel";

const blankCellStyle = css`
    box-sizing: border-box;
    border-right: ${defaultTableBorder};
    width: ${fixedCellSize}px;
    min-width: ${fixedCellSize}px;
`;
const headerCellStyle = css`
    box-sizing: border-box;
    border-right: ${defaultTableBorder};
    text-align: right;
    white-space: nowrap;
`;
const sumCellStyle = css`
    box-sizing: border-box;
    border-right: ${defaultTableBorder};
    border-left: ${highlightedTableBorder};
    background-color: ${sumRowColBackgroundColor};
    text-align: left;
    white-space: nowrap;
`;

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
}): JSX.Element[] {
    const { t } = useTranslation(["QueryPage"]);
    const headerTableCells: JSX.Element[] = [];
    headerTableCells.push(
        <TableCell
            sx={{
                padding: "0.75em",
                color: onBackgroundColor,
                borderBottom: highlightedTableBorder,
                letterSpacing: 0,
            }}
            key="header-blank"
            css={blankCellStyle}
        >
            &nbsp;
        </TableCell>
    );
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

        headerTableCells.push(
            <TableCell
                sx={{
                    padding: "0.75em",
                    color: onBackgroundColor,
                    borderBottom: highlightedTableBorder,
                    letterSpacing: 0,
                }}
                key={`header-${headerValue}`}
                css={headerCellStyle}
            >
                {headerTitle}
            </TableCell>
        );
    });
    if (props.showRowSum) {
        headerTableCells.push(
            <TableCell
                sx={{
                    padding: "0.75em",
                    color: onBackgroundColor,
                    borderBottom: highlightedTableBorder,
                    letterSpacing: 0,
                }}
                key="header-row-sum"
                css={sumCellStyle}
            >
                {t("Sums.RowSum")}
            </TableCell>
        );
    }
    return headerTableCells;
}