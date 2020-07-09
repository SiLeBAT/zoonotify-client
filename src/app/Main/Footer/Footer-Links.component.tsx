/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTranslation } from 'react-i18next';
import { primaryColor, hoverColor } from '../../Shared/Style/Style-MainTheme.component';


const footerContentStyle = css`
    margin: 0;
    display: flex;
    flex-wrap: wrap;  
    justify-content: space-between;
    flex-grow: 1;
    text-decoration: none;
`
const footerElementStyle = css`
    padding: 0.25em;
    min-width: 18.75em;
    display: flex;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.3s;
    color: ${primaryColor};
    &:hover {
        background-color: ${hoverColor};
    }
`
const linkStyle = css`
    margin: 0 auto;
    text-decoration: none;
    color: inherit;
`


export function FooterLinksComponent(): JSX.Element {
    const { t } = useTranslation(['Footer']);
    return (
        <ul css={footerContentStyle}>
            <li css={footerElementStyle}>{t('Content.Bfr')}</li>
            <li css={footerElementStyle}>{t('Content.Faq')}</li>
            <li css={footerElementStyle}><a href="/api-docs/v1/" target="_blank" css={linkStyle}>{t('Content.Api')}</a></li>
            <li css={footerElementStyle}>{t('Content.PrivacyPolicy')}</li>
        </ul>
    );
}