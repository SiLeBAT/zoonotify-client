/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTranslation } from 'react-i18next';
import { surfaceColor, primaryColor, shadowPalette } from '../../Style/Style-MainTheme.component';
import { Selector } from './Selector.component'
import { datasets } from '../../../datasets'


const contentStyle = css`
    display: flex;
    justify-content: center;
    align-items: center;
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
    hyphens: auto; 
    text-align: justify
`
const h1Style = css`
    color: ${primaryColor};
    font-size: 3rem;
    align-self: center;
    font-weight: normal;

`
const h2Style = css`
    color: ${primaryColor};
    font-size: 1rem;
    align-self: center;
    font-weight: normal;
    text-align: center
`
const pStyle = css`
    line-height: 1.6;
`
const logoStyle = css`
    align-self: start;
    margin-top: 20px;
    max-width: 100%;
    height: auto;
    margin-bottom: 20px;
`


interface ContentProps {
    name: string;
}

export function MainPageContentComponent(props: ContentProps): JSX.Element {
    const { t } = useTranslation(['MainPage-Content']);
    return (
 
            <main css={contentStyle}>
                <div css={boxStyle}>
                    <h1 css={h1Style}>{props.name}</h1>
                    <h2 css={h2Style}> {t('Subtitle', 'Web-basierte Abfrage von Surveillancedaten gemäß RL 99/2003/EU (Zoonosenrichtlinie)')}</h2>
                    <p css={pStyle}>
                        {t('MainText', 'ZooNotify bietet die Möglichkeit, einen vereinfachten Datenbestand der gemäß RL 99/2003/EU (Zoonosenrichtlinie) gesammelten Erregernachweise in der Lebensmittelkette und derer Eigenschaften, die an das Bundesinstitut für Risikobewertung (BfR) übermittelt werden, abzufragen. Mit individuellen Abfragen oder durch Bearbeitung vordefinierter Beispielabfragen lassen sich Tabellen und Grafiken nach eigenem Bedarf erzeugen.')}
                    </p>
                    <p css={pStyle}>
                        {t('SelectorIntro', 'Bitte klicken Sie auf die untenstehenden Themen, um die Liste der interaktiven Datenbank zu erweitern:')}
                    </p>
                    <div>
                        <Selector label={t('SelectorLable', 'Datensätze: ')} text={t('SelectorText', 'Bitte, Datensatz auswählen')} datasets={datasets}/>
                    </div>
                    <img src="/assets/bfr_logo.gif" alt="BfR Logo" css={logoStyle}/>
                </div>
            </main>    
    )
}