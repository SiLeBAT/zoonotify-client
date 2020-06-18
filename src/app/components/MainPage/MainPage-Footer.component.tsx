/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { surfaceColor, primaryColor, bfrBlueGrey} from '../Style/Style-MainTheme.component';

const footerStyle = css`
    color: ${primaryColor};
    background-color: ${surfaceColor};
    width: 100%;
    overflow: hidden;
`

const footerContentStyle = css`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
`

const Span = styled.span`
    padding: 10px;
    min-width: 300px;
    display: flex;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
        background-color: ${bfrBlueGrey};
    }
`

export function MainPageFooterComponent(): JSX.Element {
                   return (
                        <footer css={footerStyle}>
                            <div css={footerContentStyle}>
                                <Span>BfR - Bundesinstitut für Risikobewertung</Span>
                                <Span>FAQ</Span>
                                <Span>API-docs</Span>
                                <Span>Datenschutzerklärung</Span>
                            </div>
                        </footer>
                    );
                }
