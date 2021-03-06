/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
