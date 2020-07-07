/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useTranslation } from 'react-i18next';
import { primaryColor } from '../../../Shared/Style/Style-MainTheme.component';

const textStyle = css`
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
const normalTextStyle = css`
    line-height: 1.6;
`

export function HomePageContentComponent(): JSX.Element {
    const { t } = useTranslation(['HomePage-Content']);
    return (
        <div css={textStyle}>
            <h1 css={appNameStyle}>ZooNotify</h1>
            <h2 css={appSubtitleStyle}> {t('Subtitle')}</h2>
            <p css={normalTextStyle}>
                {t('MainText')}
            </p>
        </div>   
    )
}