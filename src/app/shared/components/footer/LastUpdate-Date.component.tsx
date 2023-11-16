import { Typography } from "@mui/material";
import { Box, useTheme } from "@mui/system";
import moment from "moment";
import React from "react";
import { useTranslation } from "react-i18next";
import { environment } from "../../../../environment";

export function LastUpdateDateComponent(): JSX.Element {
    const { lastChange } = environment;
    const { t } = useTranslation(["Footer"]);
    const dateLayout = t("Date.Layout");
    const theme = useTheme();

    const dateStyle = {
        margin: 0,
        marginLeft: "15px",
        padding: 0,
        lineHeight: "1.05",
        fontSize: "0.75rem",
        color: theme.palette.text.primary,
    };

    return (
        <Box component="p" sx={dateStyle}>
            <Typography variant="caption">
                {t("Date.Text")}{" "}
                {moment(lastChange, moment.ISO_8601, dateLayout, true).format(
                    "DD.MM.YYYY"
                )}
            </Typography>
        </Box>
    );
}
