/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { AccordionComponent } from "../../../../../../Shared/Accordion.component";
import { DataInterface } from "../../../../../../Shared/Context/DataContext";

const dataStyle = css`
    max-width: fit-content;
    margin: auto;
    box-sizing: inherit;
`;

export interface TableResultsProps {
    tableIsLoading: boolean;
    columnNameValues: string[];
    tableData: DataInterface;
    onDisplayOptionsChange: (displayOption: string) => void;
}

/**
 * @desc Returns accordion to display the results in a table
 * @param props - info about isCol/isRow and columnAttributes
 * @returns {JSX.Element} - accordion with the result table
 */
export function TableResultsLayout(props: {
    tableAccordionContent: JSX.Element;
    accordionHeader: string;
}): JSX.Element {
    return (
        <AccordionComponent
            title={props.accordionHeader}
            content={<div css={dataStyle}>{props.tableAccordionContent}</div>}
            defaultExpanded
        />
    );
}
