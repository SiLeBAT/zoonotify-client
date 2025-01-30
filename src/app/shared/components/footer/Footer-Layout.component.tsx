import React from "react";
import { Box } from "@mui/system";
import { useTheme } from "@mui/material/styles"; // Important for MUI breakpoints
import { footerHeight } from "./../../../shared/style/Style-MainTheme";

export function FooterLayoutComponent(props: {
    lastUpdateComponent: JSX.Element;
    linkListComponent: JSX.Element;
}): JSX.Element {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                width: "100%",
                // Keep your original fixed height for desktop
                height: `${footerHeight}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
                backgroundColor: theme.palette.background.paper,
                borderTop: `2px solid ${theme.palette.primary.main}`,

                // On small screens, switch to column so nothing overlaps
                [theme.breakpoints.down("sm")]: {
                    flexDirection: "column",
                    height: "auto", // let it expand for stacked items
                    alignItems: "center", // center them horizontally
                    padding: theme.spacing(1), // optional: some breathing space
                },
            }}
        >
            {/* 
        IMPORTANT: If you want the lastUpdateComponent
        to appear BELOW the links on mobile, swap the order here
      */}
            {props.lastUpdateComponent}
            {props.linkListComponent}
        </Box>
    );
}
