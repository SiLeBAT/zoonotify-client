import { Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import React from "react";

type EvaluationDivisionHeaderProps = {
    divisionTitle: string;
};

export function EvaluationDivisionHeaderComponent({
    divisionTitle,
}: EvaluationDivisionHeaderProps): JSX.Element {
    const theme = useTheme();
    return (
        <Typography
            sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                padding: "0.5em",
                margin: "1em 0",
            }}
            id={divisionTitle}
        >
            {divisionTitle}
        </Typography>
    );
}
