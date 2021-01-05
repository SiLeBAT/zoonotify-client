/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import {
    bfrPrimaryPalette,
    onPrimaryColor,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";

const titleDivStyle = (
    isTitle: boolean,
    isRow: boolean
): SerializedStyles => css`
    display: ${isTitle ? "flex" : "none"};
    align-items: ${isRow ? "flex-end" : "center"};
    justify-content: ${isRow ? "center" : "flex-end"};
    background-color: ${primaryColor};
    border-bottom: ${isRow ? "none" : `solid ${bfrPrimaryPalette[300]}`}
`;
const tableTitleStyle = (
    isTitle: boolean,
    isRow: boolean,
    height: number,
    width: number
): SerializedStyles => css`
    display: ${isTitle ? "flex" : "none"};
    width: ${isRow ? "inherit" : `${width}px`};
    height: ${isRow ? `${height}px` : "inherit"};
    min-height: max-content;
    min-width: max-content;
    margin: ${isRow ? "0.3em 0" : "0"};
    padding: ${isRow ? "0 0.2em" : "0.2em 0"};
    justify-content: center;
    align-items: center;
    font-weight: normal;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    writing-mode: ${isRow ? "vertical-lr" : "none"}; 
    transform: ${isRow ? "rotate(180deg)" : "none"};
`;

interface TableMainHeaderProps {
    isTitle: boolean;
    isRow: boolean;
    height: number;
    width: number;
    text: string;
}

export function TableResultsTableMainHeaderComponent(props: TableMainHeaderProps): JSX.Element {
    return (
        <div css={titleDivStyle(props.isTitle, props.isRow)}>
            <p
                css={tableTitleStyle(
                    props.isTitle,
                    props.isRow,
                    props.height,
                    props.width
                )}
            >
                {props.text}
            </p>
        </div>
    );
}
