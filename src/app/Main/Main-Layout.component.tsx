/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { BrowserRouter } from "react-router-dom";
import { HeaderComponent as Header } from "./Header/Header.component";
import { BodyRouterComponent as Body } from "./Body/Body-Router.component";
import { FooterLayoutComponent as Footer } from "./Footer/Footer-Layout.component";

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
    flex: 0 0 auto;
    z-index: 100;
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

/**
 * @desc Layout of the Page (Header, Body Footer,) - content of the body depends on the BrowserRouter 
 * @param {boolean} isConnected - true if client is connected to the server
 * @returns {JSX.Element} - main page component
 */
export function MainLayoutComponent(props: {
    isConnected: boolean;
}): JSX.Element {
    return (
        <div css={wrapperStyle}>
            <BrowserRouter>
                <div css={headerStyle}>
                    <Header isConnected={props.isConnected} />
                </div>
                <div css={contentWrapperStyle}>
                    <div css={bodyStyle}>
                        <Body />
                    </div>
                    <div css={footerStyle}>
                        <Footer />
                    </div>
                </div>
            </BrowserRouter>
        </div>
    );
}
