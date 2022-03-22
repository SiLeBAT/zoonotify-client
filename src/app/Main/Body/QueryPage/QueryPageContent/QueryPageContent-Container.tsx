import React, { MutableRefObject } from "react";
import { useTranslation } from "react-i18next";
import { QueryPageDatabaseStatusIndicatorComponent } from "./DatabaseStatusIndicator/QueryPage-DatabaseStatusIndicator.component";
import { QueryPageIntroTextComponent } from "./IntroText/QueryPage-IntroText.component";
import { QueryPageNrOfIsolatesComponent } from "./NumberOfIsolates/QueryPage-NrOfIsolates.component";
import { QueryPageContentLayoutComponent } from "./QueryPageContent-Layout.component";
import { QueryPageContentBarChartResultsComponent } from "./Results/Charts/QueryPageContent-BarChart.component";
import { TableResultsContainer } from "./Results/TableResults/TableResults-Container.component";
import { DataInterface } from "../../../../Shared/Context/DataContext";

export function QueryPageContentContainer(props: {
    isFilter: boolean;
    isSubFilter: boolean;
    dataIsLoading: boolean;
    columnNameValues: string[];
    data: DataInterface;
    numberOfIsolates: {
        total: number;
        filtered: number;
    };
    getPngDownloadUriRef: MutableRefObject<(() => Promise<string>) | null>;
    onDisplayOptionsChange: (displayOption: string) => void;
    onClickOpenExampleQueries: () => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeDisplayOptions = (displayOption: string): void =>
        props.onDisplayOptionsChange(displayOption);
    const handleClickOpenExampleQueries = (): void =>
        props.onClickOpenExampleQueries();

    const contentTitle = t("Content.Title");

    let queryPageInfo: JSX.Element[] = [
        <QueryPageNrOfIsolatesComponent
            numberOfIsolates={props.numberOfIsolates}
            key="nrOfIsolates-Info"
        />,
    ];

    if (!props.isFilter) {
        queryPageInfo = [
            <QueryPageIntroTextComponent
                key="introText-Info"
                onClickOpen={handleClickOpenExampleQueries}
            />,
            <QueryPageNrOfIsolatesComponent
                numberOfIsolates={props.numberOfIsolates}
                key="nrOfIsolates-Info"
            />,
        ];
    }

    return (
        <QueryPageContentLayoutComponent
            status={<QueryPageDatabaseStatusIndicatorComponent />}
            infoContent={queryPageInfo}
            tableResults={
                <TableResultsContainer
                    tableIsLoading={props.dataIsLoading}
                    isSubFilter={props.isSubFilter}
                    columnNameValues={props.columnNameValues}
                    tableData={props.data}
                    onDisplayOptionsChange={handleChangeDisplayOptions}
                />
            }
            chartResults={
                <QueryPageContentBarChartResultsComponent
                    chartIsLoading={props.dataIsLoading}
                    columnAttributes={props.columnNameValues}
                    chartData={props.data}
                    getPngDownloadUriRef={props.getPngDownloadUriRef}
                />
            }
            title={contentTitle}
        />
    );
}
