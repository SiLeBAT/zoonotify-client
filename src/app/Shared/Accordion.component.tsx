import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Typography } from "@mui/material";

export interface AccordionProps {
    title: string | JSX.Element;
    content: JSX.Element;
    defaultExpanded: boolean;
    centerContent: boolean;
}

/**
 * @desc Returns an accordion wrapper
 * @param props
 * @returns {JSX.Element} - accordion with title and content
 */
export function AccordionComponent(props: AccordionProps): JSX.Element {
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
                    {props.title}
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
