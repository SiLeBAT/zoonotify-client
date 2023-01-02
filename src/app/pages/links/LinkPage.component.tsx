import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import { LinkPageLinkListComponent } from "./LinkPage-LinkList.component";

export function LinkPageComponent(): JSX.Element {
    const { t } = useTranslation(["ExternLinks"]);
    const theme = useTheme();

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
                        color: theme.palette.primary.main,
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
