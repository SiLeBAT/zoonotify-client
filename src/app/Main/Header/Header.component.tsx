/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { NavLink } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { TranslationButtonsComponent as TranslationButtons } from './TranslationButtons.component';
import { primaryColor, onPrimaryColor } from '../../Shared/Style/Style-MainTheme.component';


const headerStyle = css`
    width: 100%;
    display: flex;
    position: fixed; 
    z-index: 100;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 6px 0 grey;
    background-color: ${primaryColor};
`
const appNameStyle = css`
    padding: 0.5em 1em 0.5em 1em;
    font-size: 1.2rem;
    text-decoration: none;
    color: ${onPrimaryColor};
    &:focus {
        outline: none;
    }
`
const queryStyle = css`
    padding: 0.5em 1em 0.5em 1em;
    margin-right: 8em;
    font-size: 1rem;
    text-decoration: none;
    color: ${onPrimaryColor};
    &:focus {
        outline: none;
    }
`
const leftHeaderStyle = css`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
`


export function HeaderLayoutComponent(): JSX.Element {
    const { t } = useTranslation(['Header']);
    return (
        <header css={headerStyle}>
            <div css={leftHeaderStyle}>
                <NavLink to="/" css={appNameStyle}>
                    ZooNotify
                </NavLink>
                <TranslationButtons />
            </div>
            <NavLink to="/filter" css={queryStyle}>
                {t('Query')}
            </NavLink>
        </header>
    );
}