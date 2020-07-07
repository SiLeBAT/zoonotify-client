/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { NavLink } from "react-router-dom";
import { TranslationButtonsComponent as TranslationButtons } from './TranslationButtons.component';
import { primaryColor, onPrimaryColor } from '../../Shared/Style/Style-MainTheme.component';


const headerStyle = css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${primaryColor};
`
const appNameStyle = css`
    padding: 0.75em;
    font-size: 2rem;
    font-weight: bold;
    color: ${onPrimaryColor};
    text-decoration: none;
`


export function HeaderLayoutComponent(): JSX.Element {
    return (
        <header css={headerStyle}>
            <NavLink to="/" css={appNameStyle}>
                ZooNotify
            </NavLink>
            <TranslationButtons />
        </header>
    );
}

