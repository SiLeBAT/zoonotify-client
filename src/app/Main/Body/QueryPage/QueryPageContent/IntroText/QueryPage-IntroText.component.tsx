import React from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export function QueryPageIntroTextComponent(props: {
    onClickOpen: () => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleClick = (): void => props.onClickOpen();

    return (
        <Card
            sx={{
                margin: "auto",
            }}
        >
            <CardContent>
                <Typography
                    sx={{
                        fontSize: "0.85rem",
                        lineHeight: "1.6",
                        textAlign: "justify",
                        hyphens: "auto",
                    }}
                >
                    {t("Content.MainText.Part1")}
                    <Button
                        variant="text"
                        onClick={handleClick}
                        size="small"
                        sx={{ padding: 0, textTransform: "none" }}
                    >
                        {t("Content.MainText.Part2")}
                    </Button>
                    {t("Content.MainText.Part3")}
                </Typography>
            </CardContent>
        </Card>
    );
}
