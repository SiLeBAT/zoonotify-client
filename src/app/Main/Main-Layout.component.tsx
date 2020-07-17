/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import {
    BrowserRouter,
  } from "react-router-dom";
import { HeaderLayoutComponent as Header } from "./Header/Header.component";
import { FooterLayoutComponent as Footer } from "./Footer/Footer-Layout.component";
import { BodyRouterComponent as Body } from './Body/Body-Router.component';

const wrapperStyle = css`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`
const bodyStyle = css`
    flex: 1 0 auto;
    margin-top: 4rem; 
`
const footerStyle = css`
    flex: 0 1 auto;
`
const headerStyle = css`
    flex: 0 1 auto;
`


export function MainLayoutComponent(): JSX.Element {
    return (
        <div css={wrapperStyle}>
            <BrowserRouter > 
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