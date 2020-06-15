import * as React from 'react';
import { MainPageHeaderComponent as Header } from "./MainPage-Header.component";
import { MainPageContentComponent as Content } from "./MainPage-Content.component";
import { MainPageFooterComponent as Footer } from "./MainPage-Footer.component";


interface LayoutProps {
    name: string;
}

export function MainPageLayoutComponent(props: LayoutProps): JSX.Element {
           return (
               <div className="wrapper">
                   <Header />;
                   <Content name={props.name} />;
                   <Footer />;
               </div>
           );
       }
