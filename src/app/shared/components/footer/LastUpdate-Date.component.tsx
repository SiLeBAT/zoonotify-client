import { Typography } from "@mui/material";
import { Box, useTheme } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { environment } from "../../../../environment";

export function LastUpdateDateComponent(): JSX.Element {
    const { lastChange } = environment;
    const { t } = useTranslation(["Footer"]);
    const theme = useTheme();

    const dateStyle = {
        margin: 0,
        marginLeft: "15px",
        padding: 0,
        lineHeight: "1.05",
        fontSize: "0.75rem",
        color: theme.palette.text.primary,
    };

    const [year, month, day] = lastChange.split(/[\sT]/)[0].split("-");
    const formatted = `${day}.${month}.${year}`;

    return (
        <Box component="p" sx={dateStyle}>
            <Typography variant="caption">
                {t("Date.Text")} {formatted}
            </Typography>
        </Box>
    );
}
