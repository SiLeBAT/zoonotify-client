/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { FooterLinksComponent as Links } from './Footer-Links.component';
import { LastUpdate } from './LastUpdate.component';
import { surfaceColor, primaryColor, tertiaryColor } from '../../Shared/Style/Style-MainTheme.component';


const footerStyle = css`
    color: ${primaryColor};
    background-color: ${surfaceColor};
    width: 100%;
    overflow: hidden;
    border-top: 2px solid ${tertiaryColor};
`


export function FooterLayoutComponent(): JSX.Element {
    return (
        <footer css={footerStyle}>
            <Links />
            <LastUpdate />
        </footer>
    );
}
