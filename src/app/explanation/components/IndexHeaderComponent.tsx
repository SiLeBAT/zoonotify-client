import { Box, Button } from "@mui/material";
import { useTheme } from "@mui/system";
import React from "react";

export function IndexHeaderComponent(props: {
    headers: string[];
}): JSX.Element {
    const theme = useTheme();

    const navButtonStyle = {
        margin: "0.25em",
        textAlign: "center",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    } as const;

    return (
        <Box sx={{ margin: "0 auto", display: "grid" }}>
            {props.headers.map((sectionHeader: string) => {
                return (
                    <Button
                        key={sectionHeader}
                        variant="contained"
                        sx={navButtonStyle}
                        href={"#" + sectionHeader}
                    >
                        {sectionHeader}
                    </Button>
                );
            })}
        </Box>
    );
}
