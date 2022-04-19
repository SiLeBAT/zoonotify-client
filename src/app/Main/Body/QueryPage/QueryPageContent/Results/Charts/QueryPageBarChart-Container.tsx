/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { MutableRefObject, SyntheticEvent, useState } from "react";
import { TFunction } from "i18next";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { AccordionComponent } from "../../../../../../Shared/Accordion.component";
import { LoadingProcessComponent } from "../../../../../../Shared/LoadingProcess.component";
import {
    DataInterface,
    DisplayOptionType,
} from "../../../../../../Shared/Context/DataContext";
import { ExplanationTextComponent } from "../../../../../../Shared/ExplanationText.component";
import { ApexChartData } from "./ApexChart.model";
import { BarChartResultsComponent } from "./BarChartResults.component";
import { processingTableDataToApexData } from "./processingTableDataToApexData.service";
import { ChatWithSubChartsComponent } from "./ChartWithSubCharts.component";

const chartOverflowStyle = css`
    overflow: auto;
`;

function generateAxisLabels(
    t: TFunction,
    rowName: string,
    colName: string,
    displayOption: DisplayOptionType,
    rowNamePath: string
): [string, string] {
    let xAxisLabel = "";
    let yAxisLabel = "";
    if (rowName !== "") {
        if (displayOption === "relative") {
            xAxisLabel = `${t("Results.NrIsolatesTextRelative")} ${t(
                "Results.per"
            )} ${t(rowNamePath)} ${t("Results.Unit")}`;
        } else if (displayOption === "absolute") {
            xAxisLabel = `${t("Results.NrIsolatesText")} ${t(
                "Results.per"
            )} ${t(rowNamePath)}`;
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
export function QueryPageBarChartContainer(props: {
    chartIsLoading: boolean;
    columnAttributes: string[];
    chartData: DataInterface;
    getPngDownloadUriRef: MutableRefObject<(() => Promise<string>) | null>;
}): JSX.Element {
    const { t } = useTranslation("QueryPage");
    const [value, setValue] = useState<number>(0);

    const handleChange = (_event: SyntheticEvent, newValue: number): void => {
        setValue(newValue);
    };

    let chartAccordionContent = (
        <ExplanationTextComponent text={t("Chart.Explanation")} />
    );

    const colName = props.chartData.column;
    const rowName = props.chartData.row;

    const isChart = colName !== "" || rowName !== "";

    let chartData = props.chartData.statisticDataAbsolute;
    let subChartData = props.chartData.statisticSubTableDataAbs;
    let xAxisMax: number | undefined;
    let displayAsStacked = false;
    if (props.chartData.option === "relative") {
        chartData = props.chartData.statisticDataRelativeChart;
        subChartData = props.chartData.statisticSubTableDataRelChart;
        xAxisMax = 100;
        displayAsStacked = true;
    }

    if (isChart) {
        const processedChartData = processingTableDataToApexData(
            chartData,
            props.columnAttributes,
            colName,
            rowName,
            false,
            t
        );

        if (_.isEmpty(processedChartData.series) || props.chartIsLoading) {
            chartAccordionContent = <LoadingProcessComponent />;
        } else {
            const [xAxisLabel, yAxisLabel] = generateAxisLabels(
                t,
                rowName,
                colName,
                props.chartData.option,
                `Filters.${rowName}`
            );

            const processedChatDataList: {
                xAxisLabel: string;
                yAxisLabel: string;
                data: ApexChartData;
            }[] = [];
            const labelList: string[] = [];

            if (rowName === "microorganism") {
                Object.keys(subChartData).forEach((subChartKey) => {
                    const { subFilterName } = subChartData[subChartKey];
                    const processedSubChartData = processingTableDataToApexData(
                        subChartData[subChartKey].tableRows,
                        props.columnAttributes,
                        colName,
                        subFilterName,
                        true,
                        t
                    );
                    const [xAxisSubLabel, yAxisSubLabel] = generateAxisLabels(
                        t,
                        subFilterName,
                        colName,
                        props.chartData.option,
                        `Subfilters.${subFilterName}.name`
                    );
                    processedChatDataList.push({
                        xAxisLabel: xAxisSubLabel,
                        yAxisLabel: yAxisSubLabel,
                        data: processedSubChartData,
                    });
                    labelList.push(t(`Subfilters.${subFilterName}.name`));
                });

                chartAccordionContent = (
                    <ChatWithSubChartsComponent
                        mainChartData={{
                            xAxisLabel,
                            yAxisLabel,
                            data: processedChartData,
                        }}
                        processedSubChatsList={processedChatDataList}
                        getPngDownloadUriRef={props.getPngDownloadUriRef}
                        xAxisMax={xAxisMax}
                        displayAsStacked={displayAsStacked}
                        labelList={labelList}
                        valueOfCurrentChart={value}
                        onChange={handleChange}
                        t={t}
                    />
                );
            } else {
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
