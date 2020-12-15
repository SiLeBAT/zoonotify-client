/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { FooterLinksComponent as Links } from "./Footer-Links.component";
import { LastUpdate } from "./LastUpdate.component";
import {
    surfaceColor,
    primaryColor,
} from "../../Shared/Style/Style-MainTheme.component";

const footerStyle = css`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    background-color: ${surfaceColor};
    border-top: 2px solid ${primaryColor};
`;

export function FooterLayoutComponent(): JSX.Element {
    return (
        <footer css={footerStyle}>
            <LastUpdate />
            <Links />
        </footer>
    );
}
