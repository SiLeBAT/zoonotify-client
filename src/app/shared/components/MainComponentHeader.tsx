import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/system";
import React from "react";

type MainComponentHeaderProps = {
    heading: string;
};

export function MainComponentHeader({
    heading,
}: MainComponentHeaderProps): JSX.Element {
    const theme = useTheme();
    return (
        <Typography
            variant="h1"
            sx={{
                paddingBottom: "0.2em",
                fontSize: "3rem",
                textAlign: "center",
                fontWeight: "normal",
                color: theme.palette.primary.main,
                borderBottom: `1px solid ${theme.palette.primary.main}`,
            }}
        >
            {heading}
        </Typography>
    );
}
