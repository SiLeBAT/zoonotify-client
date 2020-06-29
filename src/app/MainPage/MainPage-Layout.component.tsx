/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { MainPageHeaderComponent as Header } from "./MainPage-Header/MainPage-Header.component";
import { MainPageContentComponent as Content } from "./MainPage-Content/MainPage-Content.component";
import { MainPageFooterComponent as Footer } from "./MainPage-Footer/MainPage-Footer.component";


const wrapperStyle = css`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 100vh;
    align-items: center;
`
const contentStyle = css`
    flex: 1 0 auto;
`
const footerStyle = css`
    flex: 0 1 auto;

`
const headerStyle = css`
    flex: 0 1 auto;
    width: 100vw;
`


interface LayoutProps {
    name: string;
}


export function MainPageLayoutComponent(props: LayoutProps): JSX.Element {

           return (
               <div css={wrapperStyle}>
                    <div css={headerStyle}>
                        <Header />
                    </div>
                    <div css={contentStyle}>
                        <Content name={props.name} />
                    </div>
                    <div css={footerStyle}>
                        <Footer/>
                    </div>
               </div>
           );
       }