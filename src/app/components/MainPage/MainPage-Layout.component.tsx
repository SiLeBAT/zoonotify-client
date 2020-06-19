/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { MainPageHeaderComponent as Header } from "./MainPage-Header.component";
import { MainPageContentComponent as Content } from "./MainPage-Content/MainPage-Content.component";
import { MainPageFooterComponent as Footer } from "./MainPage-Footer/MainPage-Footer.component";


const wrapperStyle = css`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 100vh;
    align-items: center;
`

interface LayoutProps {
    name: string;
}


export function MainPageLayoutComponent(props: LayoutProps): JSX.Element {

           return (
               <div css={wrapperStyle}>
                   <Header />
                   <Content name={props.name} />
                   <Footer/>
               </div>
           );
       }