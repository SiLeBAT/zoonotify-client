/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { BrowserRouter } from "react-router-dom";
import { HeaderLayoutComponent as Header } from "./Header/Header.component";
import { FooterLayoutComponent as Footer } from "./Footer/Footer-Layout.component";
import { BodyRouterComponent as Body } from "./Body/Body-Router.component";

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

export function MainLayoutComponent(): JSX.Element {
    return (
        <div css={wrapperStyle}>
            <BrowserRouter>
                <div css={headerStyle}>
                    <Header />
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
