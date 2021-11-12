import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import {
    ClientIsolateCountedGroups,
    DbCollection,
    DbKey,
    MainFilterList,
    subFiltersList,
} from "../../../Shared/Model/Client_Isolate.model";
import {
    FILTER_URL,
    ISOLATE_COUNT_URL,
    ISOLATE_URL,
} from "../../../Shared/URLs";
import { LoadingOrErrorComponent } from "../../../Shared/LoadingOrError.component";
import {
    defaultFilter,
    FilterContext,
    FilterContextInterface,
} from "../../../Shared/Context/FilterContext";
import {
    DisplayOptionType,
    DataContext,
    DataInterface,
    FeatureType,
} from "../../../Shared/Context/DataContext";
import {
    ClientFiltersConfig,
    ClientSingleFilterConfig,
    FilterInterface,
    FilterType,
} from "../../../Shared/Model/Filter.model";
import { getFilterFromPath } from "./Services/PathServices/getFilterFromPath.service";
import { generatePathStringService } from "./Services/PathServices/generatePathString.service";
import { QueryPageLayoutComponent } from "./QueryPage-Layout.component";
import { CheckIfFilterIsSet } from "./Services/checkIfFilterIsSet.service";
import { chooseSelectedDisplayedFeaturesService } from "./Services/SelectorServices/chooseSelectedDisplFeatures.service";
import { chooseSelectedFiltersService } from "./Services/SelectorServices/chooseSelectedFilters.service";
import { calculateRelativeTableData } from "./Services/TableServices/calculateRelativeTableData.service";
import { adaptCountedIsolatesGroupsService } from "./Services/adaptCountedIsolatesGroups.service";
import { generateTableHeaderValuesService } from "./Services/TableServices/generateTableHeaderValues.service";
import { generateStatisticTableDataAbsService } from "./Services/TableServices/generateStatisticTableDataAbs.service";
import { getFeaturesFromPath } from "./Services/PathServices/getTableFromPath.service";
import { ApiResponse, callApiService } from "../../../Core/callApi.service";
import { generateUniqueValuesService } from "./Services/generateUniqueValues.service";
import {
    IsolateCountedDTO,
    IsolateDTO,
} from "../../../Shared/Model/Api_Isolate.model";
import { FilterConfigDTO } from "../../../Shared/Model/Api_Filter.model";
import { adaptFilterFromApiService } from "./Services/adaptFilterFromAPI.service";
import {
    calculateRowColSumsAbsolute,
    calculateRowColSumsRelative,
} from "./Services/TableServices/calculateRowColSums.service";
import { dataAndStatisticToZipFile } from "./Services/ExportServices/dataAndStatisticToZipFile.service";
import { adaptIsolatesFromAPI } from "../../../Shared/adaptIsolatesFromAPI.service";
import { generateExportLabels } from "./Services/ExportServices/generateExportLabels.service";
import { getCurrentDate } from "../../../Core/getCurrentDate.service";
import { QueryPageDrawerControlComponent } from "./Drawer/ControlBar/QueryPage-DrawerControl.component";
import { QueryPageContentContainer } from "./QueryPageContent/QueryPageContent-Container";
import { ExportDialogComponent } from "./ExportDialog/ExportDialog.component";
import { SubHeaderExportButtonComponent } from "./Subheader/SubHeader-ExportButton.component";
import { DrawerContainer } from "./Drawer/Drawer-Container.component";

export function QueryPageContainerComponent(): JSX.Element {
    const [isolateStatus, setIsolateStatus] = useState<number>();
    const [isolateCountStatus, setIsolateCountStatus] = useState<number>();
    const [filterStatus, setFilterStatus] = useState<number>();
    const [columnNameValues, setColumnNameValues] = useState<string[]>([]);
    const [totalNrOfIsol, setTotalNrOfIsol] = useState<number>(0);
    const [nrOfSelectedIsol, setNrOfSelectedIsol] = useState<number>(0);
    const [dataIsMounted, setDataIsMounted] = useState<boolean>(false);
    const [dataIsLoading, setDataIsLoading] = useState<boolean>(true);
    const [
        conditionalValuesAreLoading,
        setConditionalValuesAreLoading,
    ] = useState<boolean>(true);
    const [initialUniqueValues, setInitialUniqueValues] = useState<
        FilterInterface
    >({});
    const [loadingIsolates, setLoadingIsolates] = useState<boolean>(false);
    const [exportDialogIsOpen, setExportDialogIsOpen] = useState(false);

    const [uniqueDataValues, setUniqueDataValues] = useState<FilterInterface>(
        {}
    );
    const [subFilters, setSubFilters] = useState<ClientSingleFilterConfig[]>(
        []
    );
    const [exportOptions, setExportOptions] = useState<{
        raw: boolean;
        stat: boolean;
        chart: boolean;
    }>({
        raw: true,
        stat: true,
        chart: true,
    });
    const [drawerWidth, setDrawerWidth] = useState<number>(433);
    const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(true);

    const { filter, setFilter } = useContext(FilterContext);
    const { data, setData } = useContext(DataContext);

    const history = useHistory();
    const { t } = useTranslation(["Export", "QueryPage"]);

    const isCol: boolean = data.column !== "";
    const isRow: boolean = data.row !== "";
    const isFilter: boolean = CheckIfFilterIsSet(
        filter.selectedFilter,
        filter.mainFilter
    );
    const rowAttribute: FilterType = data.row;
    const colAttribute: FilterType = data.column;

    const isolateCountUrl: string = ISOLATE_COUNT_URL + history.location.search;

    const getPngDownloadUriRef = useRef<(() => Promise<string>) | null>(null);

    const handleClickOpenCloseDrawer = (): void => {
        if (drawerIsOpen) {
            setDrawerIsOpen(false);
        } else {
            setDrawerIsOpen(true);
        }
    };

    const handleMoveResizeBar = (newWidth: number): void => {
        setDrawerWidth(newWidth);
    };

    const handleChangeDisplFeatures = (
        selectedOption: { value: string; label: string } | null,
        keyName: FilterType | FeatureType
    ): void => {
        setDataIsLoading(true);
        const newTable: DataInterface = {
            ...data,
            [keyName]: chooseSelectedDisplayedFeaturesService(selectedOption),
        };
        const newPath: string = generatePathStringService(
            filter.selectedFilter,
            filter.mainFilter,
            newTable
        );
        history.push(newPath);
        setData(newTable);
    };

    const handleSwapDisplFeatures = (): void => {
        setDataIsLoading(true);
        const newTable: DataInterface = {
            ...data,
            row: data.column,
            column: data.row,
        };
        const newPath: string = generatePathStringService(
            filter.selectedFilter,
            filter.mainFilter,
            newTable
        );
        history.push(newPath);
        setData(newTable);
    };

    const handleRemoveAllDisplFeatures = (): void => {
        const newTable: DataInterface = {
            ...data,
            row: "" as FilterType,
            column: "" as FilterType,
        };
        const newPath: string = generatePathStringService(
            filter.selectedFilter,
            filter.mainFilter,
            newTable
        );
        history.push(newPath);
        setData(newTable);
    };

    const handleChangeFilter = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ): void => {
        const newFilter: FilterContextInterface = {
            ...filter,
            selectedFilter: {
                ...filter.selectedFilter,
                [keyName]: chooseSelectedFiltersService(selectedOption),
            },
        };
        const allFiltersList = subFiltersList.concat(MainFilterList);
        const newPath: string = generatePathStringService(
            newFilter.selectedFilter,
            allFiltersList,
            data
        );
        history.push(newPath);
        setFilter(newFilter);
    };

    const handleRemoveAllFilter = (): void => {
        const newFilter: FilterContextInterface = {
            ...filter,
            selectedFilter: defaultFilter.selectedFilter,
        };
        const newPath: string = generatePathStringService(
            newFilter.selectedFilter,
            newFilter.mainFilter,
            data
        );
        history.push(newPath);
        setFilter(newFilter);
    };

    const handleChangeDisplayOptions = (displayOption: string): void => {
        const optionValue = displayOption as DisplayOptionType;
        setData({
            ...data,
            option: optionValue,
        });
    };

    const handleSubmitFiltersToDisplay = (
        newFiltersToDisplay: string[]
    ): void => {
        const newSelectedFilters: FilterInterface = _.cloneDeep(
            filter.selectedFilter
        );
        filter.mainFilter.forEach((availableFilter) => {
            if (!_.includes(newFiltersToDisplay, availableFilter)) {
                newSelectedFilters[availableFilter] = [];
            }
        });

        const newFilter: FilterContextInterface = {
            ...filter,
            selectedFilter: newSelectedFilters,
            displayedFilters: newFiltersToDisplay,
        };
        const newPath: string = generatePathStringService(
            newFilter.selectedFilter,
            newFilter.mainFilter,
            data
        );
        history.push(newPath);
        setFilter(newFilter);
    };

    const fetchIsolatesAndExportZip = async (): Promise<void> => {
        setLoadingIsolates(true);
        let rawData: DbCollection = [];
        let rawKeys: DbKey[] = [];
        let statData: Record<string, string>[] = [];
        let statKeys: string[] = [];

        const ZNFilename = `ZooNotify_${getCurrentDate()}.csv`;

        const exportLabels = generateExportLabels(filter.mainFilter, t);
        const subFileNames = {
            raw: t("Export:FileName.DataSet"),
            stat: t("Export:FileName.Stat"),
        };

        const tableAttributeNames: {
            row: string | undefined;
            column: string | undefined;
        } = {
            row: undefined,
            column: undefined,
        };

        if (!_.isEmpty(data.row)) {
            tableAttributeNames.row = t(`QueryPage:Filters.${data.row}`);
        } else {
            tableAttributeNames.row = undefined;
        }
        if (!_.isEmpty(data.column)) {
            tableAttributeNames.column = t(`QueryPage:Filters.${data.column}`);
        } else {
            tableAttributeNames.column = undefined;
        }

        if (exportOptions.stat) {
            if (data.option === "absolute") {
                statData = data.statisticDataAbsolute;
            }
            if (data.option === "relative") {
                statData = data.statisticDataRelative;
            }
            if (!_.isEmpty(statData)) {
                statKeys = Object.keys(statData[0]);
            }
        }

        if (exportOptions.raw) {
            const urlParams = new URLSearchParams(history.location.search);
            urlParams.delete("row");
            urlParams.delete("column");
            const urlParamsString = urlParams.toString();
            const isolateFilteredUrl = `${ISOLATE_URL}?${urlParamsString}`;
            const isolateFilteredResponse: ApiResponse<IsolateDTO> = await callApiService(
                isolateFilteredUrl
            );
            const isolateFilteredStatus = isolateFilteredResponse.status;
            if (
                isolateFilteredStatus === 200 &&
                isolateFilteredResponse.data !== undefined
            ) {
                const isolateFilteredProp: IsolateDTO =
                    isolateFilteredResponse.data;
                const adaptedFilteredIsolates: DbCollection = adaptIsolatesFromAPI(
                    isolateFilteredProp
                );
                rawData = adaptedFilteredIsolates;
                rawKeys = MainFilterList;
            }
        }

        let chartImgUri: string | undefined;
        const znPngFilename = `ZooNotify_${t(
            "Export:FileName.Chart"
        )}_${getCurrentDate()}.png`;

        if (exportOptions.chart) {
            if (getPngDownloadUriRef.current !== null) {
                chartImgUri = await getPngDownloadUriRef.current();
            }
        }

        dataAndStatisticToZipFile({
            exportOptions,
            tableAttributeNames,
            rawDataSet: {
                rawData,
                rawKeys,
            },
            statDataSet: {
                statData,
                statKeys,
            },
            imgData: chartImgUri,
            ZNFilename,
            znPngFilename,
            filter: filter.selectedFilter,
            allFilterLabel: exportLabels.allFilterLabel,
            mainFilterLabels: exportLabels.mainFilterLabels,
            mainFilterAttributes: filter.mainFilter,
            subFileNames,
        });
        setExportDialogIsOpen(false);
        setLoadingIsolates(false);
    };

    const handleChangeExportData = (name: string, checked: boolean): void => {
        setExportOptions({ ...exportOptions, [name]: checked });
    };

    const handleClickExportDialogOpen = (): void => {
        setExportDialogIsOpen(true);
    };
    const handleCloseExportDialog = (): void => {
        setExportDialogIsOpen(false);
    };
    const handleExportTables = async (): Promise<void> => {
        fetchIsolatesAndExportZip();
    };

    const fetchAndSetData = async (): Promise<void> => {
        setDataIsMounted(false);
        const isolateResponse: ApiResponse<IsolateCountedDTO> = await callApiService(
            ISOLATE_COUNT_URL
        );
        const filterResponse: ApiResponse<FilterConfigDTO> = await callApiService(
            FILTER_URL
        );

        setIsolateStatus(isolateResponse.status);
        setFilterStatus(filterResponse.status);

        if (isolateResponse.data && filterResponse.data) {
            const isolateCountProp: IsolateCountedDTO = isolateResponse.data;

            const totalNrOfIsolates = isolateCountProp.totalNumberOfIsolates;

            const filterProp: FilterConfigDTO = filterResponse.data;

            const uniqueValuesObject: FilterInterface = generateUniqueValuesService(
                filterProp
            );

            const adaptedFilterProp: ClientFiltersConfig = adaptFilterFromApiService(
                filterProp
            );
            const adaptedSubFilters: ClientSingleFilterConfig[] = [];
            adaptedFilterProp.filters.forEach((adaptedFilter) => {
                if (adaptedFilter.parent !== undefined) {
                    adaptedSubFilters.push(adaptedFilter);
                }
            });

            setSubFilters(adaptedSubFilters);
            setUniqueDataValues(uniqueValuesObject);
            setInitialUniqueValues(uniqueDataValues);
            setTotalNrOfIsol(totalNrOfIsolates);
            setDataIsMounted(true);
        }
    };

    const fetchNewFilterValues = async (): Promise<void> => {
        setConditionalValuesAreLoading(true);
        const newUniqueValues = _.cloneDeep(uniqueDataValues);
        const filterStatusList: number[] = [];
        const getConditionalFilterValues = filter.displayedFilters.map(
            async (displayedFilter) => {
                const urlParams = new URLSearchParams(history.location.search);
                urlParams.delete("row");
                urlParams.delete("column");
                urlParams.delete(displayedFilter);

                const selectedFilterString = urlParams.toString();
                const conditionalFilterUrl = `${FILTER_URL}/${displayedFilter}?${selectedFilterString}`;

                const filterResponse: ApiResponse<FilterConfigDTO> = await callApiService(
                    conditionalFilterUrl
                );

                filterStatusList.push(filterResponse.status);

                if (filterResponse.data) {
                    const filterProp: FilterConfigDTO = filterResponse.data;

                    const uniqueValuesObject: FilterInterface = generateUniqueValuesService(
                        filterProp
                    );
                    newUniqueValues[displayedFilter] =
                        uniqueValuesObject[displayedFilter];
                }
            }
        );

        await Promise.all(getConditionalFilterValues);

        let finalFilterStatus = 200;
        filterStatusList.forEach((status) => {
            if (status !== 200) {
                finalFilterStatus = status;
            }
        });
        if (finalFilterStatus === 200) {
            setUniqueDataValues(newUniqueValues);
        } else {
            setUniqueDataValues(initialUniqueValues);
        }
        setFilterStatus(finalFilterStatus);
        setConditionalValuesAreLoading(false);
    };

    const setTableFromPath = (): void => {
        const [rowFromPath, colFromPath] = getFeaturesFromPath(
            history.location.search
        );
        setData({
            ...data,
            row: rowFromPath,
            column: colFromPath,
        });
    };

    const setFilterFromPath = (): void => {
        const allFiltersList = subFiltersList.concat(MainFilterList);
        const filterFromPath = getFilterFromPath(
            history.location.search,
            allFiltersList
        );
        let displFilter: string[] = filterFromPath.displayedFilters;
        if (_.isEmpty(filterFromPath.displayedFilters)) {
            displFilter = defaultFilter.displayedFilters;
        }
        setFilter({
            mainFilter: MainFilterList,
            selectedFilter: filterFromPath.selectedFilters,
            displayedFilters: displFilter,
        });
    };

    const setDataContext = (
        isolateCountGroups:
            | (Record<string, string | Date> & {
                  count: number;
              })[]
            | undefined,
        nrOfSelectedIsolates: number
    ): void => {
        if ((!isCol && !isRow) || isolateCountGroups === undefined) {
            setData({
                ...data,
                statisticDataAbsolute: [],
            });
        } else {
            const adaptedIsolateCountGroups: ClientIsolateCountedGroups = adaptCountedIsolatesGroupsService(
                isolateCountGroups
            );

            const allValuesText = t("QueryPage:Results.NrIsolatesText");

            const columnNames = generateTableHeaderValuesService(
                isCol,
                allValuesText,
                uniqueDataValues,
                filter.selectedFilter,
                colAttribute
            );
            const statisticTableDataAbs: Record<
                string,
                string
            >[] = generateStatisticTableDataAbsService(
                isRow,
                uniqueDataValues,
                filter.selectedFilter,
                allValuesText,
                adaptedIsolateCountGroups,
                columnNames,
                colAttribute,
                rowAttribute
            );

            const statisticTableDataRel = calculateRelativeTableData(
                statisticTableDataAbs,
                nrOfSelectedIsolates
            );

            const statTableDataWithSumsAbs = calculateRowColSumsAbsolute(
                statisticTableDataAbs,
                columnNames,
                nrOfSelectedIsolates.toString()
            );
            const statTableDataWithSumsRel = calculateRowColSumsRelative(
                statisticTableDataRel,
                columnNames,
                nrOfSelectedIsolates.toString(),
                statTableDataWithSumsAbs
            );

            setColumnNameValues(columnNames);
            setData({
                ...data,
                statisticDataAbsolute: statisticTableDataAbs,
                statisticDataRelative: statisticTableDataRel,
                statTableDataWithSumsAbs,
                statTableDataWithSumsRel,
            });
        }
    };

    const fetchIsolateCounted = async (): Promise<void> => {
        setDataIsLoading(true);
        const countedIsolatesResponse: ApiResponse<IsolateCountedDTO> = await callApiService(
            isolateCountUrl
        );

        setIsolateCountStatus(countedIsolatesResponse.status);

        if (countedIsolatesResponse.data !== undefined) {
            const isolateCountProp: IsolateCountedDTO =
                countedIsolatesResponse.data;
            const nrOfSelectedIsolates = isolateCountProp.totalNumberOfIsolates;
            const isolateCountGroups = isolateCountProp.groups;
            setDataContext(isolateCountGroups, nrOfSelectedIsolates);
            setNrOfSelectedIsol(nrOfSelectedIsolates);
        }
        setDataIsLoading(false);
    };

    useEffect(() => {
        fetchAndSetData();
        return () => {
            setData({ ...data, row: "", column: "" });
        };
    }, []);

    useEffect(() => {
        setTableFromPath();
        setFilterFromPath();
    }, [dataIsMounted]);

    useEffect((): void => {
        if (dataIsMounted) {
            fetchIsolateCounted();
        }
    }, [filter, data.row, data.column, isolateCountUrl]);

    useEffect((): void => {
        if (dataIsMounted) {
            fetchNewFilterValues();
        }
    }, [filter.selectedFilter, filter.displayedFilters]);

    const isLoading = dataIsLoading || conditionalValuesAreLoading;

    return (
        <LoadingOrErrorComponent
            status={{ isolateStatus, isolateCountStatus, filterStatus }}
            dataIsSet={dataIsMounted}
            componentToDisplay={
                <QueryPageLayoutComponent
                    subHeaderButton={
                        <SubHeaderExportButtonComponent
                            onClickOpen={handleClickExportDialogOpen}
                            exportDialogIsOpen={exportDialogIsOpen}
                        />
                    }
                    drawer={
                        <DrawerContainer
                            isOpen={drawerIsOpen}
                            dataIsLoading={isLoading}
                            drawerWidth={drawerWidth}
                            dataUniqueValues={uniqueDataValues}
                            filterInfo={filter}
                            subFilters={subFilters}
                            columnFeature={data.column}
                            rowFeature={data.row}
                            onDisplFeaturesChange={handleChangeDisplFeatures}
                            onDisplFeaturesSwap={handleSwapDisplFeatures}
                            onDisplFeaturesRemoveAll={
                                handleRemoveAllDisplFeatures
                            }
                            onFilterChange={handleChangeFilter}
                            onFilterRemoveAll={handleRemoveAllFilter}
                            onSubmitFiltersToDisplay={
                                handleSubmitFiltersToDisplay
                            }
                        />
                    }
                    drawerControl={
                        <QueryPageDrawerControlComponent
                            isOpen={drawerIsOpen}
                            drawerWidth={drawerWidth}
                            onDrawerOpenCloseClick={handleClickOpenCloseDrawer}
                            onResizeBarMove={handleMoveResizeBar}
                        />
                    }
                    queryPageContent={
                        <QueryPageContentContainer
                            isFilter={isFilter}
                            dataIsLoading={isLoading}
                            columnNameValues={columnNameValues}
                            data={data}
                            numberOfIsolates={{
                                total: totalNrOfIsol,
                                filtered: nrOfSelectedIsol,
                            }}
                            selectedFilter={filter.selectedFilter}
                            getPngDownloadUriRef={getPngDownloadUriRef}
                            onDisplayOptionsChange={handleChangeDisplayOptions}
                        />
                    }
                    exportDialog={
                        <ExportDialogComponent
                            exportOptions={exportOptions}
                            loading={loadingIsolates}
                            nrOfIsolates={nrOfSelectedIsol}
                            onClickClose={handleCloseExportDialog}
                            onClickExport={handleExportTables}
                            onCheckboxChange={handleChangeExportData}
                        />
                    }
                    exportDialogIsOpen={exportDialogIsOpen}
                />
            }
        />
    );
}
