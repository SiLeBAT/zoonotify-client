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
    /** gap in px between the title (summary) and the first line of content */
    contentGap?: number;
}

export function ZNAccordion(props: AccordionProps): JSX.Element {
    const {
        withTopBorder = true,
        contentGap = 0, // default: no gap
    } = props;
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
                return null;
            })
            .catch((err) => console.error("Failed to copy:", err));
    };

    return (
        <Accordion
            defaultExpanded={props.defaultExpanded}
            sx={{
                border: "none",
                boxShadow: "none",
                "&:before": { display: "none" },
                "&.Mui-expanded": { margin: "1em 0" },
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
                aria-controls="zn-accordion-content"
                id="zn-accordion-header"
                sx={{
                    px: 3, // 24px horizontal padding (default)
                    py: 0, // collapse vertical padding
                    minHeight: 0,
                    "& .MuiAccordionSummary-content": {
                        margin: 0,
                        "&.Mui-expanded": { margin: 0 },
                    },
                }}
            >
                <Typography
                    sx={{
                        flex: 1,
                        fontWeight: "bold",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        margin: 0,
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
                    // configurable gap here:
                    paddingTop: `${contentGap}px`,
                    // strip any auto paragraph margin on the first element
                    "& > :first-of-type": { marginTop: 0 },
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
