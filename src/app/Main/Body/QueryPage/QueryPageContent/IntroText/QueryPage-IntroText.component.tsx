/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Card, CardContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const normalTextStyle = css`
    font-size: 0.85rem;
    line-height: 1.6;
    text-align: justify;
    hyphens: auto;
`;

export function QueryPageIntroTextComponent(): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    return (
        <Card
            sx={{
                margin: "auto",
            }}
        >
            <CardContent>
                <Typography css={normalTextStyle}>
                    {t("Content.MainText")}
                </Typography>
            </CardContent>
        </Card>
    );
}
