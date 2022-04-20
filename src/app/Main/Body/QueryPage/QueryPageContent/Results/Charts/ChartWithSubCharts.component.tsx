/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { MutableRefObject, ReactNode, SyntheticEvent } from "react";
import { TFunction } from "i18next";
import { Tabs, Tab } from "@mui/material";
import { Box } from "@mui/system";
import { BarChartResultsComponent } from "./BarChartResults.component";
import { ApexChartInfo } from "./ApexChart.model";

const chartOverflowStyle = css`
    overflow: auto;
`;

interface TabPanelProps {
    index: number;
    value: number;
    children: ReactNode;
}

function TabPanel(props: TabPanelProps): JSX.Element {
    const { children, value, index } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

/**
 * @desc Returns accordion to display the results in a chart
 * @param props - data to display a chart
 * @returns {JSX.Element} - accordion with the result chart
 */
export function ChatWithSubChartsComponent(props: {
    mainAttribute: string;
    mainChartData: ApexChartInfo;
    getPngDownloadUriRef: MutableRefObject<(() => Promise<string>) | null>;
    processedSubChatsList: ApexChartInfo[];
    xAxisMax: number | undefined;
    displayAsStacked: boolean;
    labelList: string[];
    valueOfCurrentChart: number;
    onChange: (_event: SyntheticEvent, newValue: number) => void;
    t: TFunction;
}): JSX.Element {
    const {
        t,
        labelList,
        xAxisMax,
        displayAsStacked,
        mainChartData,
        processedSubChatsList,
        mainAttribute,
    } = props;

    const handleChange = props.onChange;
    const value = props.valueOfCurrentChart;

    const chartWithSubCharts = (
        <div>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    aria-label="basic tabs example"
                >
                    <Tab label={t(`Filters.${mainAttribute}`)} value={0} />
                    {labelList.map((label, index) => (
                        <Tab
                            key={`Tab_${label}`}
                            label={label}
                            value={index + 1}
                        />
                    ))}
                </Tabs>
            </Box>
            <div css={chartOverflowStyle}>
                <TabPanel value={value} index={0}>
                    <BarChartResultsComponent
                        chartData={mainChartData.data}
                        getPngDownloadUriRef={props.getPngDownloadUriRef}
                        xAxisLabel={mainChartData.xAxisLabel}
                        yAxisLabel={mainChartData.yAxisLabel}
                        xAxisMax={xAxisMax}
                        displayAsStacked={displayAsStacked}
                    />
                </TabPanel>
                {processedSubChatsList.map((chart, index) => (
                    <TabPanel
                        key={`TabPanel_${chart.xAxisLabel}`}
                        value={value}
                        index={index + 1}
                    >
                        <BarChartResultsComponent
                            chartData={chart.data}
                            getPngDownloadUriRef={props.getPngDownloadUriRef}
                            xAxisLabel={chart.xAxisLabel}
                            yAxisLabel={chart.yAxisLabel}
                            xAxisMax={xAxisMax}
                            displayAsStacked={displayAsStacked}
                        />
                    </TabPanel>
                ))}
            </div>
        </div>
    );

    return chartWithSubCharts;
}
