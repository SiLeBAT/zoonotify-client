/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { NavLink } from "react-router-dom";
import { TranslationButtonsComponent as TranslationButtons } from './TranslationButtons.component';
import { primaryColor, onPrimaryColor } from '../../Shared/Style/Style-MainTheme.component';


const headerStyle = css`
    width: 100%;
    display: flex;
    flex-direction: column; 
    position: fixed; 
    z-index: 100;
`
const mainHeaderStyle = css`
    display: flex;
    flex-direction: row;
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


export function HeaderLayoutComponent(): JSX.Element {
    return (
        <header css={headerStyle}>
            <div css={mainHeaderStyle}>
                <NavLink to="/" css={appNameStyle}>
                    ZooNotify
                </NavLink>
                <TranslationButtons/>
            </div>
        </header>
    );
}