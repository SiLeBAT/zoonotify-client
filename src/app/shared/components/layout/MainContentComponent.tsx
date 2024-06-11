import { Box, Paper, styled } from "@mui/material";
import React from "react";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

interface MainContentComponentProps {
    children?: React.ReactNode | null;
}

export const MainContentComponent: React.FC<MainContentComponentProps> = ({
    children,
}): JSX.Element => {
    return (
        <Item
            sx={{
                overflow: "auto", // Changed from "clip" to "auto"
                width: "100%",
                height: "100%",
                marginLeft: "20px",
                boxShadow: "15px 0 15px -15px inset",
                zIndex: 1, // Added zIndex to ensure the component is rendered above others
            }}
        >
            <Box>{children}</Box>
        </Item>
    );
};
