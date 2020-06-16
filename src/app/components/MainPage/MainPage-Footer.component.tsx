/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { surfaceColor, primaryColor, bfrPrimaryPalette } from '../Style/Style-MainTheme.component';

const footerStyle = css`
    width: 100%;
    background-color: ${surfaceColor};
    padding: 1em;
    display: flex;
    justify-content: space-around;
    color: ${primaryColor};
`

const Span = styled.span`
    cursor: pointer;
    &:hover {
        color: ${bfrPrimaryPalette[800]};
    }
`

export function MainPageFooterComponent(): JSX.Element {
                   return (
                       <footer css={footerStyle}>
                           <Span>BfR - Bundesinstitut für Risikobewertung</Span>
                           <Span>FAQ</Span>
                           <Span>Datenschutzerklärung</Span>
                       </footer>
                   );
               }
