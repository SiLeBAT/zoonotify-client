/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const titleStyle = css`
    margin: 0;
    font-weight: bold;
    font-size: 1rem;
`;
const contentStyle = css`
    margin-left: 2em;
    margin-right: 2em;
    display: block;
    hyphens: auto;
    text-align: justify;
`;

export interface AccordionProps {
    title: string;
    content: JSX.Element;
    defaultExpanded: boolean
}

/**
 * @desc Returns an accordion wrapper
 * @param props
 * @returns {JSX.Element} - accordion with title and content
 */
export function AccordionComponent(props: AccordionProps): JSX.Element {
    return (
        <Accordion defaultExpanded={props.defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <p css={titleStyle}>{props.title}</p>
            </AccordionSummary>
            <AccordionDetails css={contentStyle}>
                {props.content}
            </AccordionDetails>
        </Accordion>
    );
}
