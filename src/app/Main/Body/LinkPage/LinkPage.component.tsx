import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme";
import { LinkPageLinkListComponent } from "./LinkPage-LinkList.component";

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
                <Typography
                    variant="h1"
                    sx={{
                        marginBottom: "1rem",
                        fontSize: "3rem",
                        textAlign: "center",
                        fontWeight: "normal",
                        color: `${primaryColor}`,
                    }}
                >
                    {t("TextContent.Heading")}
                </Typography>
                <Typography
                    sx={{
                        fontSize: "0.85rem",
                        lineHeight: "1.6",
                        textAlign: "justify",
                    }}
                >
                    {t("TextContent.Text")}
                </Typography>
                {LinkPageLinkListComponent()}
            </CardContent>
        </Card>
    );
}
