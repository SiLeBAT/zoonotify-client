/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { BrowserRouter } from "react-router-dom";

import { BodyRouterComponent } from "../infrastructure/router/Body-Router.component";

const wrapperStyle = css`
    height: 100%;
    display: flex;
    z-index: 100;
    flex-direction: column;
    box-sizing: border-box;
`;

const bodyStyle = css`
    flex: 1 1 0;
    margin-top: 42px;
    z-index: 0;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
`;

/**
 * @desc Layout of the Page (Header, Body Footer,) - content of the body depends on the BrowserRouter
 * @returns {JSX.Element} - main page component
 */
export function MainLayoutComponent(): JSX.Element {
    return (
        <div css={wrapperStyle}>
            <BrowserRouter>
                <div css={bodyStyle}>
                    <BodyRouterComponent />
                </div>
            </BrowserRouter>
        </div>
    );
}
