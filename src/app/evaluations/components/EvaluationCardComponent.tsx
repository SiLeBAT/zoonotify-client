import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Link,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/system";
import React from "react";

export function EvaluationsCardComponent(props: {
    title: string;
    description: string;
    chartPath: string;
    downloadButtonText: string;
}): JSX.Element {
    const theme = useTheme();
    return (
        <Card
            sx={{
                display: "flex",
                borderRadius: 0,
                boxShadow: 0,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <CardContent
                    sx={{
                        flex: "1 0 auto",
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        component="div"
                    >
                        {props.description}
                    </Typography>
                </CardContent>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CardMedia
                    component="img"
                    image={props.chartPath}
                    alt={props.title}
                />
                <Button
                    color="primary"
                    variant="contained"
                    sx={{
                        width: "30%",
                        margin: "0.5em",
                        padding: "0em",
                        backgroundColor: theme.palette.primary.main,
                    }}
                >
                    <Link
                        href={props.chartPath}
                        download
                        sx={{
                            width: "100%",
                            padding: "0.5em 1em",
                            color: "inherit",
                            textDecoration: "none",
                        }}
                    >
                        {props.downloadButtonText}
                    </Link>
                </Button>
            </Box>
        </Card>
    );
}
