/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Card, CardContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme";
import { LinkPageLinkListComponent } from "./LinkPage-LinkList.component";

const appNameStyle = css`
    margin-bottom: 1rem;
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
`;
const normalTextStyle = css`
    font-size: 0.85rem;
    line-height: 1.6;
    text-align: justify;
`;

export function LinkPageComponent(): JSX.Element {
    const { t } = useTranslation(["ExternLinks"]);
    return (
        <Card
            sx={{
                padding: "1em",
                margin: "4rem auto",
                width: "50%",
            }}
        >
            <CardContent>
                <Typography variant="h1" css={appNameStyle}>
                    {t("TextContent.Heading")}
                </Typography>
                <Typography css={normalTextStyle}>
                    {t("TextContent.Text")}
                </Typography>
                {LinkPageLinkListComponent()}
            </CardContent>
        </Card>
    );
}
