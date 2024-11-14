import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    useTheme,
} from "@mui/material";
import Markdown from "markdown-to-jsx";

export interface AccordionProps {
    title: string;
    content: JSX.Element;
    defaultExpanded: boolean;
    centerContent: boolean;
    showCopyIcon?: boolean;
    withTopBorder?: boolean;
    maxHeight?: string;
}

export function ZNAccordion(props: AccordionProps): JSX.Element {
    const { withTopBorder = true } = props;
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const theme = useTheme();

    const contentBox = props.centerContent ? (
        <Box
            sx={{
                maxWidth: "fit-content",
                margin: "auto",
                boxSizing: "inherit",
            }}
        >
            {props.content}
        </Box>
    ) : (
        props.content
    );

    const copyToClipboard = (text: string): void => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setTooltipOpen(true);
                setTimeout(() => setTooltipOpen(false), 2000);
                return null; // This line is added to satisfy the rule
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
            });
    };

    return (
        <Accordion
            defaultExpanded={props.defaultExpanded}
            sx={{
                border: "none",
                boxShadow: "none",
                "&:before": {
                    display: "none",
                },
                "&.MuiAccordion-root.Mui-expanded": {
                    margin: "1em 0",
                },
                "& .MuiAccordionSummary-root": {
                    margin: 0,
                    borderBottom: "none",
                },
                "& .MuiAccordionDetails-root": {
                    padding: "16px 24px",
                },
                ...(withTopBorder && {
                    "&:before": {
                        display: "block",
                        content: '""',
                        width: "100%",
                        height: "2px",
                        backgroundColor: theme.palette.primary.main,
                    },
                }),
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="shared-accordion-content"
                id="shared-accordion-header"
                sx={{
                    borderBottom: "none",
                    margin: 0,
                }}
            >
                <Typography
                    sx={{
                        flex: 1,
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textAlign: "left",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Markdown>{props.title}</Markdown>
                    {props.showCopyIcon && (
                        <Tooltip
                            title="Copy to Clipboard"
                            open={tooltipOpen}
                            disableFocusListener
                            disableTouchListener
                            placement="top"
                        >
                            <IconButton
                                onClick={() => copyToClipboard(props.title)}
                                onMouseEnter={() => setTooltipOpen(true)}
                                onMouseLeave={() => setTooltipOpen(false)}
                                size="small"
                                sx={{ ml: 1 }}
                            >
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Typography>
            </AccordionSummary>
            <AccordionDetails
                sx={{
                    marginLeft: "2em",
                    marginRight: "2em",
                    display: "block",
                    hyphens: "auto",
                    textAlign: "justify",
                    ...(props.maxHeight && {
                        maxHeight: props.maxHeight,
                        overflow: "auto",
                    }),
                }}
            >
                {contentBox}
            </AccordionDetails>
        </Accordion>
    );
}
