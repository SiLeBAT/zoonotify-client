/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { BrowserRouter } from "react-router-dom";

import { BodyRouterComponent } from "../infrastructure/router/Body-Router.component";
import { HeaderComponent } from "../components/header/Header.component";
import { FooterContainer } from "../components/footer/Footer-Container.component";

// App shell: a full-viewport flex column. The header and footer take their
// natural heights and the body flexes to fill whatever is left, so nothing
// here depends on a hardcoded header/footer height.
const wrapperStyle = css`
    height: 100%;
    display: flex;
    z-index: 100;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
`;

// Body holds the routed page between header and footer. It clips here; the
// page's own main area (PageLayoutComponent) owns the scrolling.
const bodyStyle = css`
    flex: 1 1 0;
    min-height: 0;
    z-index: 0;
    box-sizing: border-box;
    overflow: hidden;
`;

/**
 * @desc Layout of the Page (Header, Body Footer,) - content of the body depends on the BrowserRouter
 * @returns {JSX.Element} - main page component
 */
export function MainLayoutComponent(): JSX.Element {
    return (
        <div css={wrapperStyle}>
            <BrowserRouter>
                <HeaderComponent />
                <div css={bodyStyle}>
                    <BodyRouterComponent />
                </div>
                <FooterContainer />
            </BrowserRouter>
        </div>
    );
}
