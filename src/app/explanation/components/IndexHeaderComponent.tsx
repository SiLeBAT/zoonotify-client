import { Box, Button } from "@mui/material";
import { useTheme } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";

export function IndexHeaderComponent(props: {
    headers: string[];
}): JSX.Element {
    const { t } = useTranslation(["InfoPage"]);
    const theme = useTheme();

    const navButtonStyle = {
        margin: "0.25em",
        textAlign: "center",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    } as const;

    return (
        <Box sx={{ margin: "0 auto", display: "grid" }}>
            {props.headers.map((sectionToken: string) => {
                return (
                    <Button
                        key={sectionToken}
                        variant="contained"
                        sx={navButtonStyle}
                        href={"#" + sectionToken}
                    >
                        {t(sectionToken)}
                    </Button>
                );
            })}
        </Box>
    );
}
