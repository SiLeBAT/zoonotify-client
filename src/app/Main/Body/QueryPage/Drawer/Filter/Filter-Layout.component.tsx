/** @jsx jsx */
import { css, jsx } from "@emotion/core";

const drawerWidthStyle = css`
    width: inherit;
`;
const filterAreaStyle = css`
    width: inherit;
    margin: 2.5em 16px 0 0;
    padding-right: 8px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;
const filterSubheadingStyle = css`
    margin: 0;
    font-weight: bold;
    font-size: 1rem;
`;

export function FilterLayoutComponent(props: {
    title: string;
    clearSelector: JSX.Element;
    filterSelectorList: JSX.Element[];
    filterDialogButton: JSX.Element;
}): JSX.Element {
    return (
        <div css={drawerWidthStyle}>
            <div css={filterAreaStyle}>
                <p css={filterSubheadingStyle}>{props.title}</p>
                {props.clearSelector}
            </div>
            {props.filterSelectorList}
            {props.filterDialogButton}
        </div>
    );
}
