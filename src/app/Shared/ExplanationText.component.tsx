import React from "react";
import { Typography } from "@mui/material";

export function ExplanationTextComponent(props: { text: string }): JSX.Element {
    return (
        <Typography sx={{ fontSize: "0.75rem", textAlign: "center" }}>
            {props.text}
        </Typography>
    );
}
