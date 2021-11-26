/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { bfrPrimaryPalette } from "../../../Shared/Style/Style-MainTheme.component";

const mainStyle = css`
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
`;

const subHeaderStyle = css`
    display: flex;
    flex: 0 auto auto;
    justify-content: flex-end;
    align-items: center;
    background-color: ${bfrPrimaryPalette[300]};
    box-sizing: border-box;
    box-shadow: 0 8px 6px -6px grey;
    z-index: 1;
`
const queryPageStyle = css`
    z-index: 0;
    display: flex;
    flex: 1 1 0;
    overflow: auto;
    flex-direction: row;
    box-sizing: border-box;
`;

export function QueryPageLayoutComponent(props: {
    subHeaderButton: JSX.Element;
    drawer: JSX.Element;
    drawerControl: JSX.Element;
    queryPageContent: JSX.Element;
    exportDialog: JSX.Element;
    exportDialogIsOpen: boolean;
}): JSX.Element {

    return (
        <main css={mainStyle}>
            <div css={subHeaderStyle}>
                {props.subHeaderButton}
            </div>
            <div css={queryPageStyle}>
                {props.drawer}
                {props.drawerControl}
                {props.queryPageContent}
            </div>
            {props.exportDialogIsOpen && (
                props.exportDialog
            )}
        </main>
    );
}
