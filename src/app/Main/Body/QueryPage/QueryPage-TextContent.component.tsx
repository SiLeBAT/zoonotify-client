/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";

const textStyle = css`
    display: flex;
    flex: 0 1 auto;
    flex-direction: column;
    hyphens: auto;
    box-sizing: inherit;
`;
const appNameStyle = css`
    font-size: 3rem;
    align-self: center;
    font-weight: normal;
    color: ${primaryColor};
`;
const appSubtitleStyle = css`
    font-size: 1rem;
    align-self: center;
    font-weight: normal;
    text-align: center;
    color: ${primaryColor};
`;
const contentTextStyle = css`
    line-height: 1.6;
    text-align: center;
`;

export function QueryPageTextContentComponent(): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    return (
        <div css={textStyle}>
            <h1 css={appNameStyle}>{t("Content.Title")}</h1>
            <h2 css={appSubtitleStyle}>{t("Content.Subtitle")}</h2>
            <p css={contentTextStyle}>{t("Content.MainText")}</p>
        </div>
    );
}
