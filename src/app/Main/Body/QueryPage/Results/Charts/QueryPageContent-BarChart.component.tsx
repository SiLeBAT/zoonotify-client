/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { TFunction } from "i18next";
import _ from "lodash";
import { MutableRefObject } from "react";
import { useTranslation } from "react-i18next";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { LoadingProcessComponent } from "../../../../../Shared/LoadingProcess.component";
import {
    primaryColor,
    secondaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";
import { ApexChartData } from "./ApexChart.model";
import { BarChartResultsComponent } from "./BarChartResults.component";

const dataStyle = css`
    margin: 0 auto;
    display: grid;
    box-sizing: border-box;
`;
const centerChartStyle = css`
    margin: auto;
`;
const explanationTextStyle = css`
    text-align: center;
    font-size: 0.75rem;
`;
const optionBarStyle = css`
    display: flex;
    justify-content: flex-end;
`;
const exportButtonStyle = css`
    background: ${primaryColor};
    &:hover {
        color: ${secondaryColor};
        background: ${primaryColor};
    }
    display: flex;
    align-items: center;
`;

function processingTableDataToApexData(
    data: Record<string, string>[],
    dataLabels: string[]
): ApexChartData {
    const apexChartSeries = [] as ApexChartData["series"];

    data.forEach((tableRow) => {
        const seriesValues: number[] = [];
        dataLabels.forEach((xLabel) => {
            seriesValues.push(Number.parseFloat(tableRow[xLabel]));
        });
        const groupData = {
            name: tableRow.name,
            data: seriesValues,
        };
        apexChartSeries.push(groupData);
    });

    return {
        series: apexChartSeries,
        dataLabels,
    };
}

function generateAxisLabels(
    t: TFunction,
    rowName: string,
    colName: string
): [string, string] {
    let lableXaxis = t("Results.TableHead");
    let lableYaxis = "";
    if (!_.isEmpty(rowName)) {
        lableXaxis = `${t("Results.TableHead")} ${t("Results.per")} ${t(
            `Filters.${rowName}`
        )}`;
    }

    if (!_.isEmpty(colName)) {
        lableYaxis = t(`Filters.${colName}`);
    }

    return [lableXaxis, lableYaxis];
}

/**
 * @desc Returns accordion to display the results in a chart
 * @param props - data to display a chart
 * @returns {JSX.Element} - accordion with the result chart
 */
export function QueryPageContentBarChartResultsComponent(props: {
    chartIsLoading: boolean;
    columnAttributes: string[];
    chartData: Record<string, string>[];
    isChart: boolean;
    getPngDownloadUriRef: MutableRefObject<(() => Promise<string>) | null>;
    onDownloadChart: () => void;
    colName: string;
    rowName: string;
}): JSX.Element {
    const { t } = useTranslation("QueryPage");

    let chartAccordionContent = (
        <div css={dataStyle}>
            <p css={explanationTextStyle}>{t("Chart.Explanation")}</p>
        </div>
    );

    const handleClick = (): void => props.onDownloadChart();

    if (props.isChart) {
        const processedChartData = processingTableDataToApexData(
            props.chartData,
            props.columnAttributes
        );

        if (_.isEmpty(processedChartData.series) || props.chartIsLoading) {
            chartAccordionContent = <LoadingProcessComponent />;
        } else {
            const [lableXaxis, lableYaxis] = generateAxisLabels(
                t,
                props.rowName,
                props.colName
            );

            chartAccordionContent = (
                <div css={dataStyle}>
                    <div css={optionBarStyle}>
                        <Button
                            css={exportButtonStyle}
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<GetAppIcon fontSize="small" />}
                            onClick={handleClick}
                        >
                            {t("Header:Export")}
                        </Button>
                    </div>
                    <div css={centerChartStyle}>
                        <BarChartResultsComponent
                            chartData={processedChartData}
                            getPngDownloadUriRef={props.getPngDownloadUriRef}
                            lableXaxis={lableXaxis}
                            lableYaxis={lableYaxis}
                        />
                    </div>
                </div>
            );
        }
    }

    return (
        <AccordionComponent
            title={t("Chart.Title")}
            content={chartAccordionContent}
            defaultExpanded
        />
    );
}
