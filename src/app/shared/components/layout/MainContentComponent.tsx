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
                // The page content (PrevalenceMainContent / EvaluationMainContent)
                // owns its own scroll container, so clip here instead of adding a
                // second nested scrollbar on the results side.
                overflow: "hidden",
                width: "100%",
                height: "100%",
                // The app only sets border-box on <html>, not universally, so this
                // Paper is content-box by default and its padding would add 16px on
                // top of height:100%, overflowing main. Keep it inside its box.
                boxSizing: "border-box",
                marginLeft: "20px",
                boxShadow: "15px 0 15px -15px inset",
            }}
        >
            <Box>{children}</Box>
        </Item>
    );
};
