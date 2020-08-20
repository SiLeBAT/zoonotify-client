/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import Divider from "@material-ui/core/Divider";
import { primaryColor, surfaceColor, shadowPalette } from "../../../Shared/Style/Style-MainTheme.component";


const headingStyle = css`
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
`;
const mainTextStyle = css`
    line-height: 1.6;
    text-align: justify;
    margin: 2em;
    padding: 1em;
    box-sizing: border-box;
    border: 1px solid ${surfaceColor};
    box-shadow: 0 3px 1px -2px ${shadowPalette.shadow1},
        0 2px 2px 0 ${shadowPalette.shadow2},
        0 1px 5px 0 ${shadowPalette.shadow3};
`;
const deviderStyle = css`
    width: 100%;
    height: 0.15em;
    background: ${primaryColor};
    padding: 0;
    margin: 0;
`;
const subHeadingTextStyle = css`
    margin-top: 2em;

`;


export function QueryPageTextContentComponent(): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    return (
        <div>
            <h1 css={headingStyle}>{t("Content.Title")}</h1>
            <p css={mainTextStyle}>{t("Content.MainText")}</p>
            <Divider variant="middle" css={deviderStyle} />
            <h3 css={subHeadingTextStyle}>{t("Results.Title")}</h3>
        </div>
    );
}
