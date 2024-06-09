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
} from "@mui/material";
import Markdown from "markdown-to-jsx";

export interface AccordionProps {
    title: string;
    content: JSX.Element;
    defaultExpanded: boolean;
    centerContent: boolean;
    showCopyIcon?: boolean; // This is the new boolean flag property
}

export function ZNAccordion(props: AccordionProps): JSX.Element {
    let { content } = props;
    const [tooltipOpen, setTooltipOpen] = useState(false);

    if (props.centerContent) {
        content = (
            <Box
                sx={{
                    maxWidth: "fit-content",
                    margin: "auto",
                    boxSizing: "inherit",
                }}
            >
                {props.content}
            </Box>
        );
    }

    const copyToClipboard = (text: string): void => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setTooltipOpen(true);
                setTimeout(() => setTooltipOpen(false), 2000);
                return null; // Return null to satisfy linting
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
                throw err; // Throw error to satisfy linting
            });
    };

    return (
        <Accordion defaultExpanded={props.defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="shared-accordion-content"
                id="shared-accordion-header"
            >
                <Typography
                    sx={{
                        flex: 1,
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textAlign: "left",
                        margin: 0,
                        display: "flex",
                        alignItems: "center", // To align the title and the icon properly
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
                                sx={{ ml: 1 }} // Add some space between the title and the icon
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
                }}
            >
                {content}
            </AccordionDetails>
        </Accordion>
    );
}
