import React from "react";
import { Box, Button } from "@mui/material";
import { useTheme } from "@mui/system";
import { Evaluation, EvaluationCategory } from "./Evaluations.model";

export function EvaluationsPageNavButtonComponent(props: {
    evaluationsData: Evaluation;
}): JSX.Element {
    const theme = useTheme();
    return (
        <Box sx={{ display: "grid" }}>
            <Box sx={{ margin: "0 auto", display: "grid" }}>
                {Object.keys(props.evaluationsData).map((category) => (
                    <Button
                        variant="contained"
                        sx={{
                            margin: "0.25em",
                            textAlign: "center",
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                        }}
                        href={`#${category}`}
                        key={`nav_button-${category}`}
                    >
                        {
                            props.evaluationsData[
                                category as EvaluationCategory
                            ].mainTitle
                        }
                    </Button>
                ))}
            </Box>
        </Box>
    );
}
