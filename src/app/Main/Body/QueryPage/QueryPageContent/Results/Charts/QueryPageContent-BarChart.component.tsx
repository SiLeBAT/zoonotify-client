/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { TFunction } from "i18next";
import _ from "lodash";
import { MutableRefObject } from "react";
import { useTranslation } from "react-i18next";
import { AccordionComponent } from "../../../../../../Shared/Accordion.component";
import { LoadingProcessComponent } from "../../../../../../Shared/LoadingProcess.component";
import {
    DataInterface,
    DisplayOptionType,
} from "../../../../../../Shared/Context/DataContext";
import { ApexChartData } from "./ApexChart.model";
import { BarChartResultsComponent } from "./BarChartResults.component";

const chartOverflowStyle = css`
    overflow-x: auto;
`;
const explanationTextStyle = css`
    text-align: center;
    font-size: 0.75rem;
`;

function processingTableDataToApexData(
    data: Record<string, string>[],
    dataLabels: string[], 
    yAttribute: string, 
    xAttribute: string,
    t: TFunction
): ApexChartData {
    const apexChartSeries = [] as ApexChartData["series"];

    data.forEach((tableRow) => {
        const seriesValues: number[] = [];
        dataLabels.forEach((xLabel) => {
            seriesValues.push(Number.parseFloat(tableRow[xLabel]));
        });
        let seriesLabel = t("Results.NrIsolatesText");
        if (xAttribute !== "") {
            const seriesLabelKey = tableRow.name.replace(".", "") 
            seriesLabel = t(`FilterValues.${xAttribute}.${seriesLabelKey}`);
        }
        

        const seriesData = {
            name: seriesLabel,
            data: seriesValues,
        };
        apexChartSeries.push(seriesData);
    });

    let newDataLabels = [t("Results.NrIsolatesText")];
    if (yAttribute !== "") {
        const translatedDataLabels: string[] = []
        dataLabels.forEach(dataLabel => {
            const dataLabelKey = dataLabel.replace(".", "")
            translatedDataLabels.push(t(`FilterValues.${yAttribute}.${dataLabelKey}`))
        });
        newDataLabels = translatedDataLabels
    }
    

    return {
        series: apexChartSeries,
        dataLabels: newDataLabels,
    };
}

function generateAxisLabels(
    t: TFunction,
    rowName: string,
    colName: string,
    displayOption: DisplayOptionType
): [string, string] {
    let xAxisLabel = "";
    let yAxisLabel = "";
    if (rowName !== "") {
        if (displayOption === "relative") {
            xAxisLabel = `${t("Results.NrIsolatesTextRelative")} ${t(
                "Results.per"
            )} ${t(`Filters.${rowName}`)} ${t("Results.Unit")}`;
        } else if (displayOption === "absolute") {
            xAxisLabel = `${t("Results.NrIsolatesText")} ${t(
                "Results.per"
            )} ${t(`Filters.${rowName}`)}`;
        }
    } else if (displayOption === "relative") {
        xAxisLabel = `${t("Results.NrIsolatesTextRelative")} ${t(
            "Results.Unit"
        )}`;
    } else if (displayOption === "absolute") {
        xAxisLabel = t("Results.NrIsolatesText");
    }

    if (colName !== "") {
        yAxisLabel = t(`Filters.${colName}`);
    }

    return [xAxisLabel, yAxisLabel];
}

/**
 * @desc Returns accordion to display the results in a chart
 * @param props - data to display a chart
 * @returns {JSX.Element} - accordion with the result chart
 */
export function QueryPageContentBarChartResultsComponent(props: {
    chartIsLoading: boolean;
    columnAttributes: string[];
    chartData: DataInterface;
    getPngDownloadUriRef: MutableRefObject<(() => Promise<string>) | null>;
}): JSX.Element {
    const { t } = useTranslation("QueryPage");

    let chartAccordionContent = (
        <div>
            <p css={explanationTextStyle}>{t("Chart.Explanation")}</p>
        </div>
    );

    const colName = props.chartData.column;
    const rowName = props.chartData.row;

    const isChart = colName !== "" || rowName !== "";

    let chartData = props.chartData.statisticDataAbsolute;
    let xAxisMax;
    let displayAsStacked = false
    if (props.chartData.option === "relative") {
        chartData = props.chartData.statisticDataRelative;
        xAxisMax = 100;
        displayAsStacked = true
    }

    if (isChart) {
        const processedChartData = processingTableDataToApexData(
            chartData,
            props.columnAttributes,
            colName, 
            rowName,
            t
        );

        if (_.isEmpty(processedChartData.series) || props.chartIsLoading) {
            chartAccordionContent = <LoadingProcessComponent />;
        } else {
            const [xAxisLabel, yAxisLabel] = generateAxisLabels(
                t,
                rowName,
                colName,
                props.chartData.option
            );

            chartAccordionContent = (

                    <div css={chartOverflowStyle}>
                        <BarChartResultsComponent
                            chartData={processedChartData}
                            getPngDownloadUriRef={props.getPngDownloadUriRef}
                            xAxisLabel={xAxisLabel}
                            yAxisLabel={yAxisLabel}
                            xAxisMax={xAxisMax}
                            displayAsStacked={displayAsStacked}
                        />
                    </div>
            );
        }
    }

    return (
        <AccordionComponent
            title={t("Chart.Title")}
            content={chartAccordionContent}
            defaultExpanded
            centerContent={false}
        />
    );
}
