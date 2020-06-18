/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { primaryColor, backgroundColor } from '../Style/Style-MainTheme.component';


const headerStyle = css`
    width: 100%;
    display: flex;
    background-color: ${primaryColor};
`
const appNameStyle = css`
    padding: 1rem;
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
