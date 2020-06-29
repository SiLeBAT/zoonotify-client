/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTranslation } from 'react-i18next';
import { surfaceColor, primaryColor, shadowPalette } from '../../Style/Style-MainTheme.component';
import { Selector } from './Selector.component'
import { datasets } from '../../datasets'


const contentStyle = css`
    display: flex;
    flex: 0 1 auto;
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
    flex: 0 1 auto;
    flex-direction: column;
    justify-content: space-between;
    align-self: flex-start;
    hyphens: auto; 
    text-align: justify
`
const appNameStyle = css`
    color: ${primaryColor};
    font-size: 3rem;
    align-self: center;
    font-weight: normal;
`
const appSubtitleStyle = css`
    color: ${primaryColor};
    font-size: 1rem;
    align-self: center;
    font-weight: normal;
    text-align: center
`
const textStyle = css`
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
                    <h1 css={appNameStyle}>{props.name}</h1>
                    <h2 css={appSubtitleStyle}> {t('Subtitle')}</h2>
                    <p css={textStyle}>
                        {t('MainText')}
                    </p>
                    <p css={textStyle}>
                        {t('SelectorIntro')}
                    </p>
                    <div>
                        <Selector label={t('SelectorLabel')} text={t('SelectorText')} datasets={datasets}/>
                    </div>
                    <img src="/assets/bfr_logo.gif" alt="BfR Logo" css={logoStyle}/>
                </div>
            </main>    
    )
}