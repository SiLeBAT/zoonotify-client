/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { BrowserRouter } from "react-router-dom";
import { HeaderComponent } from "./Header/Header.component";
import { BodyRouterComponent } from "./Body/Body-Router.component";
import { FooterContainer } from "./Footer/Footer-Container.component";

const wrapperStyle = css`
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
`;
const bodyStyle = css`
    flex: 1 1 0;
    box-sizing: border-box;
    overflow: auto;
`;

/**
 * @desc Layout of the Page (Header, Body Footer,) - content of the body depends on the BrowserRouter
 * @returns {JSX.Element} - main page component
 */
export function MainLayoutComponent(): JSX.Element {
    return (
        <div css={wrapperStyle}>
            <BrowserRouter>
                <div>
                    <HeaderComponent />
                </div>
                <div css={bodyStyle}>
                    <BodyRouterComponent />
                </div>
                <FooterContainer />
            </BrowserRouter>
        </div>
    );
}
