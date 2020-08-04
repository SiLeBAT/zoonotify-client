/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { BrowserRouter } from "react-router-dom";
import { HeaderLayoutComponent as Header } from "./Header/Header.component";
import { FooterLayoutComponent as Footer } from "./Footer/Footer-Layout.component";
import { BodyRouterComponent as Body } from "./Body/Body-Router.component";

const wrapperStyle = css`
    height: 100%;
    display: table;
`;
const bodyStyle = css`
    height: auto;
    display: table-row;
`;
const footerStyle = css`
    height: 1px;
    display: table-row;
`;
const headerStyle = css`
    width: 100%;
    height: 42px;
    position: fixed;
    display: table-row;
`;

export function MainLayoutComponent(): JSX.Element {
    return (
        <div css={wrapperStyle}>
            <BrowserRouter>
                <div css={headerStyle}>
                    <Header />
                </div>
                <div css={bodyStyle}>
                    <Body />
                </div>
                <div css={footerStyle}>
                    <Footer />
                </div>
            </BrowserRouter>
        </div>
    );
}
