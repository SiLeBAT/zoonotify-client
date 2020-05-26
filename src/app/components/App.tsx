import * as React from 'react';

interface AppProps {
    name: string;
}

export default function App({ name }: AppProps) {
    return (
        <div className="wrapper">
            <div className="header">
                <span className="appName">ZooNotify</span>
            </div>
            <div className="content">
                <div className="box">
                    <h1>ZooNotify</h1>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Debitis ratione amet quas aliquid quod nostrum ullam
                        voluptate quam corporis, recusandae maxime voluptates
                        eaque consectetur! Exercitationem atque iste est optio
                        labore.Lorem ipsum dolor sit amet consectetur
                        adipisicing elit. Debitis ratione amet quas aliquid quod
                        nostrum ullam voluptate quam corporis, recusandae maxime
                        voluptates eaque consectetur! Exercitationem atque iste
                        est optio labore.Lorem ipsum dolor sit amet consectetur
                        adipisicing elit. Debitis ratione amet quas aliquid quod
                        nostrum ullam voluptate quam corporis, recusandae maxime
                        voluptates eaque consectetur! Exercitationem atque iste
                        est optio labore.
                    </p>
                    <div>
                        <label htmlFor="dataset1"> Dataset1</label>
                        <select
                            id="dataset1"
                            name="Dataset"
                            // onChange="setVisibility()"
                        >
                            <option value="1">Dataset 1</option>
                            <option value="2">Dataset 2</option>
                            <option value="3">Dataset 3</option>
                            <option value="4">Dataset 4</option>
                        </select>
                    </div>
                    <img className="logo" src="/assets/bfr_logo.gif" alt="BfR Logo" />
                </div>
            </div>
            <div className="footer">
                <span>BfR - Bundesinstitut für Risikobewertung</span>
                <span>FAQ</span>
                <span>Datenschutzerklärung</span>
            </div>
        </div>
    );
}
