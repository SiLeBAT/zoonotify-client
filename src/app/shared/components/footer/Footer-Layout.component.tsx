import React from "react";
import { Box, useTheme } from "@mui/material";
import { footerHeight } from "../../../shared/style/Style-MainTheme";

interface FooterLayoutProps {
    lastUpdateComponent: JSX.Element;
    linkListComponent: JSX.Element;
}

export function FooterLayoutComponent({
    lastUpdateComponent,
    linkListComponent,
}: FooterLayoutProps): JSX.Element {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                // On mobile (xs, sm), let it scroll with the page:
                position: "static",
                width: "100%",
                backgroundColor: theme.palette.background.paper,
                borderTop: `2px solid ${theme.palette.primary.main}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: theme.spacing(1),
                boxSizing: "border-box",

                // On md+ (≥900px by default), fix it at the bottom:
                [theme.breakpoints.up("md")]: {
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${footerHeight}px`,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: theme.spacing(0, 2),
                    zIndex: 1000, // Added z-index to ensure footer stays above other content
                },
            }}
        >
            {lastUpdateComponent}
            {linkListComponent}
        </Box>
    );
}
