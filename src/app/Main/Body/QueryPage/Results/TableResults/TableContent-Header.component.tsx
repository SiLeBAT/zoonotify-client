/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { withStyles, createStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import { useTranslation } from "react-i18next";
import { DisplayOptionType } from "../../../../../Shared/Context/TableContext";
import { onBackgroundColor } from "../../../../../Shared/Style/Style-MainTheme.component";
import {
    highlightedTableBorder,
    fixedCellSize,
    defaultTableBorder,
    sumRowColBackgroundColor,
} from "./ResultsTable.style";

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
const StyledTableCell = withStyles(() =>
    createStyles({
        head: {
            padding: "0.75em",
            color: onBackgroundColor,
            borderBottom: highlightedTableBorder,
            letterSpacing: 0,
        },
        body: {
            color: onBackgroundColor,
            fontSize: 14,
        },
    })
)(TableCell);

/**
 * @desc Returns list of table cells for the table header
 * @param headerValues - object with two booleans, true if row/column is selected
 * @returns {JSX.Element[]} - list of table cell components
 */
export function TableContentHeaderComponent(props: {
    showRowSum: boolean;
    headerValues: string[];
    colAttribute: string;
    tableOption: DisplayOptionType;
    isCol: boolean;
}): JSX.Element[] {
    const { t } = useTranslation(["QueryPage"]);
    const headerTableCells: JSX.Element[] = [];
    headerTableCells.push(
        <StyledTableCell key="header-blank" css={blankCellStyle}>
            &nbsp;
        </StyledTableCell>
    );
    props.headerValues.forEach((headerValue): void => {
        let headerTitle = "";
        if (props.isCol) {
            headerTitle = t(
                `FilterValues.${props.colAttribute}.${headerValue.replace(".", "")}`
            );
            if (props.tableOption === "relative") {
                headerTitle = `${headerTitle} ${t("Results.Unit")}`;
            }
        } else if (props.tableOption === "relative") {
            headerTitle = t("Results.TableHeadRelative");
        } else if (props.tableOption === "absolute") {
            headerTitle = t("Results.TableHead");
        }

        headerTableCells.push(
            <StyledTableCell
                key={`header-${headerValue}`}
                css={headerCellStyle}
            >
                {headerTitle}
            </StyledTableCell>
        );
    });
    if (props.showRowSum) {
        headerTableCells.push(
            <StyledTableCell key="header-row-sum" css={sumCellStyle}>
                {t("Sums.RowSum")}
            </StyledTableCell>
        );
    }
    return headerTableCells;
}
