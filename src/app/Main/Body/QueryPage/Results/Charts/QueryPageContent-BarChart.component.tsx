/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { BarChartResultsComponent } from "./BarChartResults.component";

const dataStyle = css`
    margin: auto;
    box-sizing: border-box;
`;

const explanationTextStyle = css`
    font-size: 0.75rem;
`;

/**
 * @desc Returns accordion to display the results in a chart
 * @param props - data to display a chart
 * @returns {JSX.Element} - accordion with the result chart
 */
export function QueryPageContentBarChartResultsComponent(props: {
    columnAttributes: string[];
    chartData: Record<string, string>[];
    isChart: boolean;
}): JSX.Element {
    const { t } = useTranslation("QueryPage");

    let chartAccordionContent = (
        <div css={dataStyle}>
            <p css={explanationTextStyle}>{t("Chart.Explanation")}</p>
        </div>
    );
    if (props.isChart) {
        chartAccordionContent = (
            <div css={dataStyle}>
                <BarChartResultsComponent
                    columnAttributes={props.columnAttributes}
                    chartData={props.chartData}
                />
            </div>
        );
    }

    return <AccordionComponent title="Chart" content={chartAccordionContent} />;
}
