/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTranslation } from 'react-i18next';
import { LastUpdate } from './LastUpdate.component';
import { surfaceColor, primaryColor, hoverColor, tertiaryColor } from '../../Style/Style-MainTheme.component';

const footerStyle = css`
    color: ${primaryColor};
    background-color: ${surfaceColor};
    width: 100%;
    overflow: hidden;
    border-top: 2px solid ${tertiaryColor};
`
const footerContentStyle = css`
    width: 100%;
    display: flex;
    flex: 0 1 auto;
    flex-wrap: wrap;  
`
const spanStyle = css`
    padding: 10px;
    min-width: 300px;
    display: flex;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
        background-color: ${hoverColor};
    }
`


export function MainPageFooterComponent(): JSX.Element {
    const { t } = useTranslation(['MainPage-Footer']);
    return (
        <footer css={footerStyle}>
            <div css={footerContentStyle}>
                <span css={spanStyle}>{t('Content.Bfr', 'BfR - Bundesinstitut für Risikobewertung')}</span>
                <span css={spanStyle}>{t('Content.Faq', 'FAQ')}</span>
                <span css={spanStyle}>{t('Content.Api', 'API-docs')}</span>
                <span css={spanStyle}>{t('Content.PrivacyPolicy', 'Datenschutzerklärung')}</span>
            </div>
            <LastUpdate />
        </footer>
    );
}
