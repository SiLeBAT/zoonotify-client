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
    getSize: (
        node: HTMLElement | null,
        key: "height" | "totalWidth" | "partWidth"
    ) => void,
    isRowNotCol: boolean,
    isRowAndCol: boolean,
    style: (isRow: boolean, isRowAndCol: boolean) => SerializedStyles
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    elements.push(
        <StyledTableCell
            key="header-blank"
            ref={(node: HTMLElement | null) => getSize(node, "partWidth")}
            css={style(isRowNotCol, isRowAndCol)}
        >
            &nbsp;
        </StyledTableCell>
    );
    headerValues.forEach((element): void => {
        elements.push(
            <StyledTableCell
                key={`header-${element}`}
                css={style(isRowNotCol, isRowAndCol)}
            >
                {element}
            </StyledTableCell>
        );
    });
    return elements;
}
