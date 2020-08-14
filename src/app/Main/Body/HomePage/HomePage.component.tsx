/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { HomePageContentComponent as Content } from "./HomePage-Content.component";
import {
    surfaceColor,
    shadowPalette,
} from "../../../Shared/Style/Style-MainTheme.component";

const contentStyle = css`
    height: 100%;
    padding-top: 4rem;
    padding-bottom: 5rem;
    box-sizing: border-box;
`;
const boxStyle = css`
    padding: 1em;
    margin: auto;
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-self: flex-start;
    flex: 0 1 auto;
    hyphens: auto;
    text-align: justify;
    box-sizing: inherit;
    border: 1px solid ${surfaceColor};
    box-shadow: 0 3px 1px -2px ${shadowPalette.shadow1},
        0 2px 2px 0 ${shadowPalette.shadow2},
        0 1px 5px 0 ${shadowPalette.shadow3};
`;
const boxFooterStyle = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: inherit;
`;
const logoStyle = css`
    margin-top: 2rem;
    max-width: 100%;
    height: auto;
    margin-bottom: 2rem;
`;

export function HomePageLayoutComponent(): JSX.Element {
    return (
        <main css={contentStyle}>
            <div css={boxStyle}>
                <Content />
                <div css={boxFooterStyle}>
                    <img
                        src="/assets/bfr_logo.gif"
                        alt="BfR Logo"
                        css={logoStyle}
                    />
                </div>
            </div>
        </main>
    );
}
