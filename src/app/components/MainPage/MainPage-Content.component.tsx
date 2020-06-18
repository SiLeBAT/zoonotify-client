/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { surfaceColor, primaryColor, shadowPalette } from '../Style/Style-MainTheme.component';
import { Selector } from '../Selector.component'
import { datasets } from '../../datasets'


const contentStyle = css`
    display: flex;
    justify-content: center;
    padding: 2em;
    flex: 1;
    flex-shrink: 0;
    flex-grow: 1;
`
const boxStyle = css`
    padding: 1em;
    border: 1px solid ${surfaceColor};
    width: 50%;
    box-shadow: 0 3px 1px -2px ${shadowPalette.shadow1}, 0 2px 2px 0 ${shadowPalette.shadow2},
    0 1px 5px 0 ${shadowPalette.shadow3};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-self: flex-start;
`
const logoStyle = css`
    align-self: start;
    margin-top: 20px;
    max-width: 100%;
    height: auto;
`
const Img = styled.img`
    margin-bottom: 20px;
`
const H1 = styled.h1`
    color: ${primaryColor};
    font-size: 3rem;
    align-self: center;
    font-weight: normal;
`
const H2 = styled.h2`
    color: ${primaryColor};
    font-size: 1rem;
    align-self: center;
    font-weight: normal;
`

interface ContentProps {
    name: string;
}

export function MainPageContentComponent(props: ContentProps): JSX.Element {
    return (
 
            <main css={contentStyle}>
                <div css={boxStyle}>

                    <H1>{props.name}</H1>
                    <H2>
                        Web-basierte Abfrage von Surveillancedaten gemäß RL 99/2003/EU (Zoonosenrichtlinie)
                    </H2>
                    <p>
                        ZooNotify bietet die Möglichkeit, einen vereinfachten Datenbestand der gemäß RL 99/2003/EU (Zoonosenrichtlinie) gesammelten Erregernachweise in der Lebensmittelkette und derer Eigenschaften, die an das Bundesinstitut für Risikobewertung (BfR) übermittelt werden, abzufragen. Mit individuellen Abfragen oder durch Bearbeitung vordefinierter Beispielabfragen lassen sich Tabellen und Grafiken nach eigenem Bedarf erzeugen.
                    </p>
                    <p>
                        Bitte klicken Sie auf die untenstehenden Themen, um die Liste der interaktiven Datenbank zu erweitern:
                    </p>
                    <div>
                        <Selector datasets={datasets}/>
                    </div>
                    <Img src="/assets/bfr_logo.gif" alt="BfR Logo" css={logoStyle}/>
                </div>
            </main>
         
       
    )
}
