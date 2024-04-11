import { Box, Button, Card, CardContent, CardMedia, Link } from "@mui/material";
import { useTheme } from "@mui/system";
import {
    footerHeight,
    headerHeight,
} from "./../../shared/style/Style-MainTheme";
import Markdown from "markdown-to-jsx";
import React, { useCallback, useState } from "react";
import ImageViewer from "react-simple-image-viewer";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

const copyToClipboard = async (text: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text);
        console.log("Title copied to clipboard");
    } catch (err) {
        console.error("Failed to copy: ", err);
    }
};
export function EvaluationsCardComponent(props: {
    id: string; // Add this line to accept the id prop
    title: string;
    description: string;
    chartPath: string;
    dataPath: string;
    downloadGraphButtonText: string;
    downloadDataButtonText: string;
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
                data-id={props.id} // Add this line to set the data-id attribute
                sx={{
                    display: "flex",
                    flexDirection: ["column", "row"],
                    borderRadius: 0,
                    boxShadow: 0,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: ["100%", "50%"],
                    }}
                >
                    <CardContent
                        sx={{
                            flex: "1 0 auto",
                            display: "flex",
                            justifyContent: "space-between", // Adjust if necessary
                            alignItems: "center",
                        }}
                    >
                        <Markdown>{props.description}</Markdown>
                        {/* IconButton with copy icon */}
                        <Tooltip title="Copy title to clipboard" arrow>
                            <IconButton
                                size="small"
                                onClick={() => copyToClipboard(props.title)}
                                aria-label="Copy title"
                                sx={{
                                    position: "absolute",
                                    top: "15%",
                                    right: "35px",
                                    transform: "translateY(-50%)",
                                }}
                            >
                                <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                    </CardContent>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: ["100%", "50%"],
                    }}
                >
                    <CardMedia
                        component="img"
                        sx={{ cursor: "pointer" }}
                        image={props.chartPath}
                        alt={props.title}
                        onClick={() => openImageViewer()}
                    />
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: ["column", "row"],
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            mt: 2,
                        }}
                    >
                        <Button
                            color="primary"
                            variant="contained"
                            sx={{
                                margin: "0.5em",
                                padding: "0em",
                                backgroundColor: theme.palette.primary.main,
                                "@media (max-width: 450px)": {
                                    fontSize: "0.7em",
                                },
                                "@media (max-width: 350px)": {
                                    fontSize: "0.6em",
                                },
                            }}
                        >
                            <Link
                                href={props.dataPath}
                                download
                                sx={{
                                    width: "100%",
                                    padding: "0.5em 1em",
                                    color: "inherit",
                                    textDecoration: "none",
                                }}
                            >
                                {props.downloadDataButtonText}
                            </Link>
                        </Button>
                        <Button
                            color="primary"
                            variant="contained"
                            sx={{
                                margin: "0.5em",
                                padding: "0em",
                                backgroundColor: theme.palette.primary.main,
                                "@media (max-width: 450px)": {
                                    fontSize: "0.7em",
                                },
                                "@media (max-width: 350px)": {
                                    fontSize: "0.6em",
                                },
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
                                {props.downloadGraphButtonText}
                            </Link>
                        </Button>
                    </Box>
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
                        maxHeight: `calc(100vh - ${footerHeight}px - ${headerHeight}px)`,
                        top: `${headerHeight}px`,
                        zIndex: "105",
                    }}
                    closeOnClickOutside={true}
                />
            )}
        </>
    );
}
