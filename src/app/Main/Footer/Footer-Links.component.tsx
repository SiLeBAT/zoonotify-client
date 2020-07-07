/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTranslation } from 'react-i18next';
import { hoverColor } from '../../Shared/Style/Style-MainTheme.component';


const footerContentStyle = css`
    width: 100%;
    display: flex;
    flex-wrap: wrap;  
    justify-content: space-between;
`
const linkStyle = css`
    padding: 0.75em;
    min-width: 18.75em;
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


export function FooterLinksComponent(): JSX.Element {
    const { t } = useTranslation(['Footer']);
    return (
        <div css={footerContentStyle}>
            <div css={linkStyle}>{t('Content.Bfr')}</div>
            <div css={linkStyle}>{t('Content.Faq')}</div>
            <div css={linkStyle}>{t('Content.Api')}</div>
            <div css={linkStyle}>{t('Content.PrivacyPolicy')}</div>
        </div>
    );
}
