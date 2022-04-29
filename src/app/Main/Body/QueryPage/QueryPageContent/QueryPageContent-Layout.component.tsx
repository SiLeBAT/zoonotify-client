import React from "react";
import { Typography, Box } from "@mui/material";
import { useTheme } from "@mui/system";

const contentStyle = {
    width: 0,
    padding: "2em",
    flex: "1 1 0",
    hyphens: "auto",
    boxSizing: "border-box",
    overflow: "auto",
} as const;

const contentBoxStyle = {
    maxWidth: "45em",
    margin: "auto",
    boxSizing: "border-box",
} as const;

const resultsBoxStyle = {
    marginTop: "2em",
} as const;

export function QueryPageContentLayoutComponent(props: {
    status: JSX.Element;
    infoContent: JSX.Element[];
    tableResults: JSX.Element;
    chartResults: JSX.Element;
    title: string;
}): JSX.Element {
    const theme = useTheme();

    const headingStyle = {
        margin: 0,
        minWidth: "7em",
        fontSize: "3rem",
        textAlign: "center",
        fontWeight: "normal",
        color: theme.palette.primary.main,
    } as const;

    return (
        <Box sx={contentStyle}>
            <Typography sx={headingStyle}>{props.title}</Typography>
            {props.status}
            <Box sx={contentBoxStyle}>{props.infoContent}</Box>
            <Box sx={resultsBoxStyle}>
                {props.tableResults}
                {props.chartResults}
            </Box>
        </Box>
    );
}
