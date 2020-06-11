import * as React from 'react';
import Header from './MainPage-Header.component';
import Content from './MainPage-Content.component';
import Footer from './MainPage-Footer.component';


interface LayoutProps {
    name: string;
}

export default function MainPageLayoutComponent(props: LayoutProps) {
    return (
        <div className="wrapper">
            <Header />;
            <Content name={props.name}/>;
            <Footer />;
        </div>
    );

}

