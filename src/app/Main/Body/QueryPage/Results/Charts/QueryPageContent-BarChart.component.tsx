/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button } from "@material-ui/core";
import _ from "lodash";
import { MutableRefObject } from "react";
import { useTranslation } from "react-i18next";
import { AccordionComponent } from "../../../../../Shared/Accordion.component";
import { LoadingProcessComponent } from "../../../../../Shared/LoadingProcess.component";
import { primaryColor, secondaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";
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
`
const exportButtonStyle = css`
    background: ${primaryColor};
    &:hover {
        color: ${secondaryColor};
        background: ${primaryColor};
    }
`

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

/**
 * @desc Returns accordion to display the results in a chart
 * @param props - data to display a chart
 * @returns {JSX.Element} - accordion with the result chart
 */
export function QueryPageContentBarChartResultsComponent(props: {
    columnAttributes: string[];
    chartData: Record<string, string>[];
    isChart: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    barChartRef: MutableRefObject<any>;
    onDownloadChart: () => void;
}): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /* const barChartRef = useRef<any>(null); */
    const { t } = useTranslation("QueryPage");

    let chartAccordionContent = (
        <div css={dataStyle}>
            <p css={explanationTextStyle}>{t("Chart.Explanation")}</p>
        </div>
    );

    /* const handlePngDownload = (): void => {
        barChartRef?.current?.chart
            .dataURI()
            .then((uri: {imgURI: string}) => {
                const a = document.createElement("a");
                a.href = uri.imgURI;
                a.target = "_blank";
                a.download = "ZN_chart.png";
                a.click();
                return uri;
            })
            .catch("error");
    }; */

    const handleClick = (): void => props.onDownloadChart()

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
                    <div css={optionBarStyle}>
                        <Button css={exportButtonStyle} size="small" variant="contained" color="primary" onClick={handleClick} >Download</Button>
                    </div>
                    <div css={centerChartStyle}>
                        <BarChartResultsComponent
                            chartData={processedChartData}
                            barChartRef={props.barChartRef}
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
