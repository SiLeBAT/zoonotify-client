import React, { MutableRefObject } from "react";
import { useTranslation } from "react-i18next";
import { QueryPageDatabaseStatusIndicatorComponent } from "./DatabaseStatusIndicator/QueryPage-DatabaseStatusIndicator.component";
import { QueryPageIntroTextComponent } from "./IntroText/QueryPage-IntroText.component";
import { QueryPageNrOfIsolatesComponent } from "./NumberOfIsolates/QueryPage-NrOfIsolates.component";
import { QueryPageParameterContentComponent } from "./Parameter/QueryPage-ParameterContent.component";
import { QueryPageContentLayoutComponent } from "./QueryPageContent-Layout.component";
import { QueryPageContentBarChartResultsComponent } from "./Results/Charts/QueryPageContent-BarChart.component";
import { TableResultsContainer } from "./Results/TableResults/TableResults-Container.component";
import { DataInterface } from "../../../../Shared/Context/DataContext";
import { FilterInterface } from "../../../../Shared/Model/Filter.model";

export function QueryPageContentContainer(props: {
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
}): JSX.Element {
  const { t } = useTranslation(["QueryPage"]);

  const handleChangeDisplayOptions = (displayOption: string): void =>
    props.onDisplayOptionsChange(displayOption);

  const contentTitle = t("Content.Title");

  const queryPageInfo = props.isFilter ? (
    <QueryPageParameterContentComponent selectedFilter={props.selectedFilter} />
  ) : (
    <QueryPageIntroTextComponent />
  );

  return (
    <QueryPageContentLayoutComponent
      status={<QueryPageDatabaseStatusIndicatorComponent />}
      queryPageInfo={queryPageInfo}
      nrOfIsolates={
        <QueryPageNrOfIsolatesComponent
          numberOfIsolates={props.numberOfIsolates}
        />
      }
      tableResults={
        <TableResultsContainer
          tableIsLoading={props.dataIsLoading}
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
