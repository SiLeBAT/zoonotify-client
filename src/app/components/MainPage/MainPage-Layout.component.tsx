/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { MainPageHeaderComponent as Header } from "./MainPage-Header.component";
import { MainPageContentComponent as Content } from "./MainPage-Content.component";
import { MainPageFooterComponent as Footer } from "./MainPage-Footer.component";


const wrapperStyle = css`
    display: flex;
    flex-direction: column;
    min-height: 100%;
`

interface LayoutProps {
    name: string;
}

export function MainPageLayoutComponent(props: LayoutProps): JSX.Element {
           return (
               <div css={wrapperStyle}>
                   <Header />
                   <Content name={props.name} />
                   <Footer />
               </div>
           );
       }
