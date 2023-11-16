import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Typography } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Markdown from "markdown-to-jsx";
import React from "react";

export interface AccordionProps {
    title: string;
    content: JSX.Element;
    defaultExpanded: boolean;
    centerContent: boolean;
}

/**
 * @desc Returns an accordion wrapper
 * @param props
 * @returns {JSX.Element} - accordion with title and content
 */
export function ZNAccordion(props: AccordionProps): JSX.Element {
    let { content } = props;

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
    return (
        <Accordion defaultExpanded={props.defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="shared-accordion-content"
                id="shared-accordion-header"
            >
                <Typography
                    sx={{ margin: 0, fontWeight: "bold", fontSize: "1rem" }}
                >
                    <Markdown>{props.title}</Markdown>
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
