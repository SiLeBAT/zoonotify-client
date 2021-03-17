/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { withStyles, createStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import {
    primaryColor,
    onBackgroundColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";

const blankCellStyle = css`
    box-sizing: border-box;
    border-right: 1px solid lightgrey;
    width: 160px;
    min-width: 160px;
`
const headerCellStyle = css`
    box-sizing: border-box;
    border-right: 1px solid lightgrey;
    :last-child {
        border-right: none;
    }
    text-align: right;
    white-space: nowrap;
`;

const StyledTableCell = withStyles(() =>
    createStyles({
        head: {
            padding: "0.75em",
            color: onBackgroundColor,
            borderBottom: `1px solid ${primaryColor}`,
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
 * @param {string[]} headerValues - object with two booleans, true if row/column is selected
 * @returns {JSX.Element[]} - list of table cell components
 */
export function TableContentHeaderComponent(
    headerValues: string[]
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    elements.push(
        <StyledTableCell
            key="header-blank"
            css={blankCellStyle}        >
            &nbsp;
        </StyledTableCell>
    );
    headerValues.forEach((element): void => {
        elements.push(
            <StyledTableCell
                key={`header-${element}`}
                css={headerCellStyle}            >
                {element}
            </StyledTableCell>
        );
    });
    return elements;
}
