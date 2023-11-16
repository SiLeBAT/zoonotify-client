import { Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * @desc Returns a card wrapper with BfR-Logo
 * @param props
 * @returns {JSX.Element} - card with title, subtitle, text and BfR-Logo
 */
export function LogoComponent(): JSX.Element {
    const { t } = useTranslation(["HomePage"]);
    return (
        <Box>
            <Typography
                sx={{
                    fontSize: "0.85rem",
                    lineHeight: "1.6",
                    textAlign: "justify",
                }}
            >
                {t("Initative")}
            </Typography>
            <img
                src="/assets/bfr_logo.png"
                title="BfR Logo"
                style={{
                    height: "60px",
                    width: "auto",
                    padding: "25px",
                    backgroundColor: "white",
                }}
            />
        </Box>
    );
}
