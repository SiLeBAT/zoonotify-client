/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { FooterLinkListComponent } from "./Footer-LinkList.component";
import { LastUpdateComponent } from "./LastUpdate.component";
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
            <LastUpdateComponent />
            <FooterLinkListComponent />
        </footer>
    );
}
