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
                // Bottom row of the app-shell column (sibling of header/body).
                // flexShrink: 0 keeps it at its natural height so it is always
                // visible and never gets squeezed or scrolled off-screen.
                position: "static",
                flexShrink: 0,
                width: "100%",
                backgroundColor: theme.palette.background.paper,
                borderTop: `2px solid ${theme.palette.primary.main}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: theme.spacing(1),
                boxSizing: "border-box",

                // On md+ (≥900px by default), render it as a single row. It sits
                // at the bottom of the app-shell column as a natural-height flex
                // item, so it no longer needs position: fixed.
                [theme.breakpoints.up("md")]: {
                    height: `${footerHeight}px`,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: theme.spacing(0, 2),
                    zIndex: 1000,
                },
            }}
        >
            {lastUpdateComponent}
            {linkListComponent}
        </Box>
    );
}
