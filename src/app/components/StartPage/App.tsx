import * as React from 'react';
import Header from './Header';
import Content from './MainContent';
import Footer from './Footer';


interface AppProps {
    name: string;
    datasets: {
        label: string;
        dataset: any;
    }
}

export default function App(props: AppProps) {
    return (
        <div className="wrapper">
            <Header />;
            <Content name={props.name} datasets={props.datasets}/>;
            <Footer />;
        </div>
    );

}

