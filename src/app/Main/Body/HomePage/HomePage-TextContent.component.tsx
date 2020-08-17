/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";

const textStyle = css`
    display: flex;
    flex: 0 1 auto;
    flex-direction: column;
    justify-content: space-between;
    align-self: flex-start;
    hyphens: auto;
    text-align: justify;
    box-sizing: border-box;
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
const normalTextStyle = css`
    line-height: 1.6;
`;

export function HomePageTextContentComponent(): JSX.Element {
    const { t } = useTranslation(["HomePage"]);
    return (
        <div css={textStyle}>
            <h1 css={appNameStyle}>ZooNotify</h1>
            <h2 css={appSubtitleStyle}> {t("Subtitle")}</h2>
            <p css={normalTextStyle}>{t("MainText")}</p>
        </div>
    );
}
