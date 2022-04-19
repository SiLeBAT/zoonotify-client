import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/system";

export function LoadingProcessComponent(): JSX.Element {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                "& > * + *": {
                    marginLeft: theme.spacing(2),
                },
            }}
        >
            <CircularProgress
                sx={{ margin: "3em auto", color: theme.palette.primary.main }}
            />
        </Box>
    );
}
