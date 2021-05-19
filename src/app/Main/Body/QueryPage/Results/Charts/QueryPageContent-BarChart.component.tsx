/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { LoadingProcessComponent } from "../../../../../Shared/LoadingProcess.component";
import { ApexChartData } from "./ApexChart.model";
import { BarChartResultsComponent } from "./BarChartResults.component";

const dataStyle = css`
    margin: auto;
    box-sizing: border-box;
`;

const explanationTextStyle = css`
    font-size: 0.75rem;
`;

function processingTableDataToApexData(
    data: Record<string, string>[],
    xLabels: string[]
): ApexChartData {
    const apexChartData = {} as ApexChartData;
    const apexChartSeries = [] as typeof apexChartData.series;

    data.forEach((tableRow) => {
        const seriesValues: number[] = [];
        xLabels.forEach((xLabel) => {
            seriesValues.push(Number.parseFloat(tableRow[xLabel]));
        });
        const groupData = {
            name: tableRow.name,
            data: seriesValues,
        };
        apexChartSeries.push(groupData);
    });

    apexChartData.series = apexChartSeries;
    apexChartData.xLabels = xLabels;

    return apexChartData;
}

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
        const processedChartData = processingTableDataToApexData(
            props.chartData,
            props.columnAttributes
        );

        if (_.isEmpty(processedChartData.series)) {
            chartAccordionContent = <LoadingProcessComponent />;
        } else {
            chartAccordionContent = (
                <div css={dataStyle}>
                    <BarChartResultsComponent chartData={processedChartData} />
                </div>
            );
        }
    }

    return <AccordionComponent title="Chart" content={chartAccordionContent} />;
}
