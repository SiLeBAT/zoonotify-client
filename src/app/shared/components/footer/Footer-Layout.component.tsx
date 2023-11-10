import React from "react";
import { Box, useTheme } from "@mui/system";
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
                height: `${footerHeight}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
                backgroundColor: theme.palette.background.paper,
                borderTop: `2px solid ${theme.palette.primary.main}`,
            }}
        >
            {props.lastUpdateComponent}
            {props.linkListComponent}
        </Box>
    );
}
