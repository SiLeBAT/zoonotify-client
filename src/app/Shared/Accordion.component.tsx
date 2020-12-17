/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";


const titleStyle = css`
    margin: 0;
`;
const contentStyle = css`
    margin-left: 2em;
    display: block;
`;

interface AccordionProps {
    title: string;
    content: JSX.Element
}

export function AccordionComponent(props: AccordionProps): JSX.Element {
    return (
        <Accordion defaultExpanded>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <h3 css={titleStyle}>{props.title}</h3>
            </AccordionSummary>
            <AccordionDetails css={contentStyle}>
                {props.content}
            </AccordionDetails>
        </Accordion>
    );
}
