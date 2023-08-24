import { Box, Button, Card, CardContent, CardMedia, Link } from "@mui/material";
import { useTheme } from "@mui/system";
import Markdown from "markdown-to-jsx";
import React, { useCallback, useState } from "react";
import ImageViewer from "react-simple-image-viewer";

export function EvaluationsCardComponent(props: {
    title: string;
    description: string;
    chartPath: string;
    downloadButtonText: string;
}): JSX.Element {
    const theme = useTheme();
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const openImageViewer = useCallback(() => {
        setIsViewerOpen(true);
    }, []);

    const closeImageViewer = (): void => {
        setIsViewerOpen(false);
    };

    return (
        <>
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
                        width: "50%",
                    }}
                >
                    <CardContent
                        sx={{
                            flex: "1 0 auto",
                        }}
                    >
                        <Markdown>{props.description}</Markdown>
                    </CardContent>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "50%",
                    }}
                >
                    <CardMedia
                        component="img"
                        sx={{ cursor: "pointer" }}
                        image={props.chartPath}
                        alt={props.title}
                        onClick={() => openImageViewer()}
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
            {isViewerOpen && (
                <ImageViewer
                    src={[props.chartPath]}
                    currentIndex={0}
                    onClose={closeImageViewer}
                    disableScroll={true}
                    backgroundStyle={{
                        backgroundColor: "rgba(0,0,0,0.9)",
                    }}
                    closeOnClickOutside={true}
                />
            )}
        </>
    );
}
