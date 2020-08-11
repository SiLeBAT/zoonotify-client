/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { BrowserRouter } from "react-router-dom";

const wrapperStyle = css`
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
`;
const bodyStyle = css`
    width: 100%;
    flex: 1 0 auto;
    box-sizing: border-box;
    overflow: auto;
`;
const footerStyle = css`
    flex: 0 0 auto;
    box-sizing: border-box;
`;
const headerStyle = css`
    width: 100%;
    height: 42px;
    flex: 0 0 auto;
    box-sizing: border-box;
`;
const contentWrapperStyle = css`
    width: 100%;
    height: 0;
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    overflow: auto;
`;

interface MainLayoutProps {
    headerComponent: JSX.Element;
    bodyComponent: JSX.Element;
    footerComponent: JSX.Element;
}

export function MainLayoutComponent(props: MainLayoutProps): JSX.Element {
    return (
        <div css={wrapperStyle}>
            <BrowserRouter>
                <div css={headerStyle}>{props.headerComponent}</div>
                <div css={contentWrapperStyle}>
                    <div css={bodyStyle}>{props.bodyComponent}</div>
                    <div css={footerStyle}>{props.footerComponent}</div>
                </div>
            </BrowserRouter>
        </div>
    );
}
