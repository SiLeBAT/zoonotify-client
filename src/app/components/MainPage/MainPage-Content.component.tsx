import React from 'react';
import {Selector} from '../Selector.component'
import {datasets} from '../../datasets'

interface ContentProps {
    name: string;
}

export function MainPageContentComponent(props: ContentProps): JSX.Element {

    return (
        <main className="content">
            <div className="box">
                <h1>{props.name}</h1>
                <h2>
                    Web-basierte Abfrage von Surveillancedaten gemäß RL 99/2003/EU (Zoonosenrichtlinie)
                </h2>
                <p>
                    ZooNotify bietet die Möglichkeit, einen vereinfachten Datenbestand der gemäß RL 99/2003/EU (Zoonosenrichtlinie) gesammelten Erregernachweise in der Lebensmittelkette und derer Eigenschaften, die an das Bundesinstitut für Risikobewertung (BfR) übermittelt werden, abzufragen. Mit individuellen Abfragen oder durch Bearbeitung vordefinierter Beispielabfragen lassen sich Tabellen und Grafiken nach eigenem Bedarf erzeugen.
                </p>
                <p>
                    Bitte klicken Sie auf die untenstehenden Themen, um die Liste der interaktiven Datenbank zu erweitern:
                </p>
                <div>
                    <Selector datasets={datasets}/>
                </div>
                <img className="logo" src="/assets/bfr_logo.gif" alt="BfR Logo"/>
            </div>
        </main>
    )
}
