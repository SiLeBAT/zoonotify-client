/** @jsx jsx */
import { css, jsx } from '@emotion/core';

const logoStyle = css`
    margin-top: 2rem;
    max-width: 100%;
    height: auto;
    margin-bottom: 2rem;
`


export function BfrLogoComponent(): JSX.Element {
    return (
        <img src="/assets/bfr_logo.gif" alt="BfR Logo" css={logoStyle}/>  
    )
}





