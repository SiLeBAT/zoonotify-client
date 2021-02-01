/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { CardContent, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";

const appNameStyle = css`
    margin-bottom: 1rem;
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
`;
const appSubtitleStyle = css`
    margin: 1em 0;
    font-size: 0.85rem;
    font-weight: normal;
    text-align: center;
`;
const normalTextStyle = css`
    font-size: 0.85rem;
    line-height: 1.6;
    text-align: justify;
`;

export function ErrorPageTextContentComponent(): JSX.Element {
    const { t } = useTranslation(["ErrorPage"]);
    return (
        <CardContent>
            <Typography variant="h1" css={appNameStyle}>
                404
            </Typography>
            <Typography variant="h2" css={appSubtitleStyle}>
                {t("Subtitle")}
            </Typography>
            <Typography css={normalTextStyle}>{t("MainText")}</Typography>
        </CardContent>
    );
}
