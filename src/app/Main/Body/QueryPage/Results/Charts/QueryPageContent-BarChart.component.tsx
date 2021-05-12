/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { BarChartResultsComponent } from "./BarChartResults.component";

const dataStyle = css`
    max-width: fit-content;
    margin: auto;
    box-sizing: inherit;
`;

/**
 * @desc Returns accordion to display the results in a chart
 * @param props - data to display a graph
 * @returns {JSX.Element} - accordion with the result chart
 */
export function QueryPageContentBarChartResultsComponent(props: {
    columnAttributes: string[];
    graphicData: Record<string, string>[];
}): JSX.Element {
    const tableAccordionContent = (
        <div css={dataStyle}>
            <BarChartResultsComponent
                columnAttributes={props.columnAttributes}
                graphicData={props.graphicData}
            />
        </div>
    );

    return (
        <AccordionComponent title="Chart" content={tableAccordionContent} />
    );
}
