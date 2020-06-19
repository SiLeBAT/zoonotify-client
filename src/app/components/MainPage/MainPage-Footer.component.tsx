/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import moment from 'moment';
import { surfaceColor, primaryColor, bfrBlueGrey } from '../Style/Style-MainTheme.component';

const footerStyle = css`
    color: ${primaryColor};
    background-color: ${surfaceColor};
    width: 100%;
    overflow: hidden;
    border-top: 2px solid rgb(51, 77, 107);
`

const footerContentStyle = css`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
`

const footerDateStyle = css`
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${bfrBlueGrey};
    background-color: rgb(51, 77, 107);
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

const P = styled.p`
    padding: 0;
`

interface FooterProps {
    lastChange: string;
}

export function MainPageFooterComponent(props: FooterProps): JSX.Element {
                   return (
                        <footer css={footerStyle}>
                            <div css={footerContentStyle}>
                                <Span>BfR - Bundesinstitut für Risikobewertung</Span>
                                <Span>FAQ</Span>
                                <Span>API-docs</Span>
                                <Span>Datenschutzerklärung</Span>
                            </div>
                            <div css={footerDateStyle}>
                                <P>Letzte Änderung: {moment(props.lastChange, "YYYY-MM-DD HH:mm:ss Z", "de").format("L")}
                                </P>
                            </div>
                        </footer>
                    );
                }
