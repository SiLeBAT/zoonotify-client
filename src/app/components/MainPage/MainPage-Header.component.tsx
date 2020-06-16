/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { primaryColor, backgroundColor } from '../Style/Style-MainTheme.component';


const headerStyle = css`
    width: 100%;
    background-color: ${primaryColor};
    padding: 1em;
    display: flex;
`
const appNameStyle = css`
    font-size: 2rem;
    font-weight: bold;
    color: ${backgroundColor};
`

export function MainPageHeaderComponent(): JSX.Element {
           return (
               <header css={headerStyle}>
                   <span css={appNameStyle}>ZooNotify</span>
               </header>
           );
       }
