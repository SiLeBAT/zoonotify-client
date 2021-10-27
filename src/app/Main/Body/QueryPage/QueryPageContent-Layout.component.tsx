/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { MutableRefObject } from "react";
import { useTranslation } from "react-i18next";
import { QueryPageIntroTextComponent } from "./IntroText/QueryPage-IntroText.component";
import { QueryPageParameterContentComponent } from "./Parameter/QueryPage-ParameterContent.component";
import { QueryPageNrOfIsolatesComponent } from "./NumberOfIsolates/QueryPage-NrOfIsolates.component";
import { primaryColor } from "../../../Shared/Style/Style-MainTheme.component";
import { QueryPageContentTableResultsLayoutComponent } from "./Results/TableResults/QueryPageContent-TableResultsLayout.component";
import { FilterInterface } from "../../../Shared/Model/Filter.model";
import { DataInterface } from "../../../Shared/Context/DataContext";
import { QueryPageDatabaseStatusIndicatorComponent } from "./DatabaseStatusIndicator/QueryPage-DatabaseStatusIndicator.component";
import { QueryPageContentBarChartResultsComponent } from "./Results/Charts/QueryPageContent-BarChart.component";

const contentStyle = css`
    width: 0;
    padding: 2em;
    flex: 1 1 0;
    hyphens: auto;
    box-sizing: border-box;
    overflow: auto;
`;
const contentBoxStyle = css`
    max-width: 45em;
    margin: auto;
    box-sizing: border-box;
`;
const headingStyle = css`
    margin: 0;
    min-width: 7em;
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
`;

const resultsBoxStyle = css`
    margin-top: 2em;
`;

export function QueryPageContentLayoutComponent(props: {
    isFilter: boolean;
    dataIsLoading: boolean;
    columnNameValues: string[];
    data: DataInterface;
    numberOfIsolates: {
        total: number;
        filtered: number;
    };
    selectedFilter: FilterInterface;
    getPngDownloadUriRef: MutableRefObject<(() => Promise<string>) | null>;
    onDisplayOptionsChange: (displayOption: string) => void;
    onDownloadChart: () => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeDisplayOptions = (displayOption: string): void =>
        props.onDisplayOptionsChange(displayOption);

    const handleChartDownload = (): void => props.onDownloadChart();

    return (
        <div css={contentStyle}>
            <p css={headingStyle}>{t("Content.Title")}</p>
            <QueryPageDatabaseStatusIndicatorComponent />
            <div css={contentBoxStyle}>
                {props.isFilter ? (
                    <QueryPageParameterContentComponent
                        selectedFilter={props.selectedFilter}
                    />
                ) : (
                    <QueryPageIntroTextComponent />
                )}
                <QueryPageNrOfIsolatesComponent
                    numberOfIsolates={props.numberOfIsolates}
                />
            </div>
            <div css={resultsBoxStyle}>
                <QueryPageContentTableResultsLayoutComponent
                    tableIsLoading={props.dataIsLoading}
                    columnNameValues={props.columnNameValues}
                    tableData={props.data}
                    onDisplayOptionsChange={handleChangeDisplayOptions}
                />
                <QueryPageContentBarChartResultsComponent
                    chartIsLoading={props.dataIsLoading}
                    columnAttributes={props.columnNameValues}
                    chartData={props.data}
                    getPngDownloadUriRef={props.getPngDownloadUriRef}
                    onDownloadChart={handleChartDownload}
                />
            </div>
        </div>
    );
}
