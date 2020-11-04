/** @jsx jsx */
import { jsx, SerializedStyles } from "@emotion/core";
import { withStyles, createStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import {
    primaryColor,
    onBackgroundColor,
} from "../../../../Shared/Style/Style-MainTheme.component";

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

export function Header(
    headerValues: string[],
    isIsolates: boolean,
    isRowNotCol: boolean,
    style: (isIsolates: boolean, isRow: boolean) => SerializedStyles
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    if (!isIsolates) {
        elements.push(
            <StyledTableCell
                key="header-blank"
                css={style(isIsolates, isRowNotCol)}
            >
                &nbsp;
            </StyledTableCell>
        );
    }
    headerValues.forEach((element): void => {
        elements.push(
            <StyledTableCell
                key={`header-${element}`}
                css={style(isIsolates, isRowNotCol)}
            >
                {element}
            </StyledTableCell>
        );
    });
    return elements;
}
