/** @jsx jsx */
import { css, jsx } from "@emotion/core";
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

export function FooterLayoutComponent(props: {
    lastUpdateComponent: JSX.Element;
    linkListComponent: JSX.Element;
}): JSX.Element {
    return (
        <footer css={footerStyle}>
            {props.lastUpdateComponent}
            {props.linkListComponent}
        </footer>
    );
}
