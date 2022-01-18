import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import GetAppIcon from "@mui/icons-material/GetApp";
import {
    mainFilterList,
    allSubFiltersList,
} from "../../../Shared/Model/Client_Isolate.model";
import { ISOLATE_COUNT_URL } from "../../../Shared/URLs";
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
import { getFeaturesFromPath } from "./Services/PathServices/getTableFromPath.service";
import { ApiResponse, callApiService } from "../../../Core/callApi.service";
import { IsolateCountedDTO } from "../../../Shared/Model/Api_Isolate.model";
import { QueryPageDrawerControlComponent } from "./Drawer/ControlBar/QueryPage-DrawerControl.component";
import { QueryPageContentContainer } from "./QueryPageContent/QueryPageContent-Container";
import { ExportDialogComponent } from "./ExportDialog/ExportDialog.component";
import { DrawerContainer } from "./Drawer/Drawer-Container.component";
import { exportZipService } from "./Services/ContainerServices/exportZip.service";
import { generateDataObjectsService } from "./Services/ContainerServices/generateDataObjects.services";
import { fetchInitialDataService } from "./Services/ContainerServices/fetchInitialData.service";
import { fetchConditionalFilters } from "./Services/ContainerServices/fetchConditionalFilters.service";
import { ExampleQueriesDialogComponent } from "./ExampleQueriesDialog/ExampleQueriesDialog.component";
import { SubHeaderButtonComponent } from "./Subheader/SubHeader-Button.component";

export function QueryPageContainerComponent(): JSX.Element {
    const [serverStatus, setServerStatus] = useState<{
        isolateStatus: number | undefined;
        isolateCountStatus: number | undefined;
        filterStatus: number | undefined;
        exportDataStatus: number | undefined;
    }>({
        isolateStatus: undefined,
        isolateCountStatus: undefined,
        filterStatus: undefined,
        exportDataStatus: undefined,
    });
    const [columnNameValues, setColumnNameValues] = useState<string[]>([]);
    const [totalNrOfIsol, setTotalNrOfIsol] = useState<number>(0);
    const [nrOfSelectedIsol, setNrOfSelectedIsol] = useState<number>(0);
    const [dataIsMounted, setDataIsMounted] = useState<boolean>(false);
    const [dataIsLoading, setDataIsLoading] = useState<boolean>(true);
    const [updateFilterAndDataIsLoading, setUpdateFilterAndDataIsLoading] =
        useState<boolean>(true);
    const [initialUniqueValues, setInitialUniqueValues] =
        useState<FilterInterface>({});
    const [loadingIsolates, setLoadingIsolates] = useState<boolean>(false);
    const [exportDialogIsOpen, setExportDialogIsOpen] = useState(false);
    const [queryDialogIsOpen, setQueryDialogIsOpen] = useState(false);

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

    const parameterString = history.location.search
        .replace("row=", "group-by=")
        .replace("column=", "group-by=");

    const isolateCountUrl = `${ISOLATE_COUNT_URL}${parameterString}`;

    const getPngDownloadUriRef = useRef<(() => Promise<string>) | null>(null);

    // handle Drawer

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

    // handle display features

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

    // handle filters

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
        subFilters.forEach((subFilter) => {
            const subFilterTrigger = subFilter.trigger;
            if (
                subFilterTrigger !== undefined &&
                !_.includes(
                    newFilter.selectedFilter.microorganism,
                    subFilterTrigger
                ) &&
                !_.includes(newFilter.selectedFilter.matrix, subFilterTrigger)
            ) {
                newFilter.selectedFilter[subFilter.id] = [];
            }
        });
        const allFiltersList = allSubFiltersList.concat(mainFilterList);
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

    // handle display options

    const handleChangeDisplayOptions = (displayOption: string): void => {
        const optionValue = displayOption as DisplayOptionType;
        setData({
            ...data,
            option: optionValue,
        });
    };

    // handle displayed filters

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

    // handle export

    const fetchIsolatesAndExportZip = async (): Promise<void> => {
        setLoadingIsolates(true);
        const urlParams = new URLSearchParams(history.location.search);
        const exportStatus = await exportZipService({
            t,
            filter,
            data,
            exportOptions,
            urlParams,
            getPngDownloadUriRef,
        });
        setExportDialogIsOpen(false);
        setLoadingIsolates(false);
        setServerStatus({ ...serverStatus, exportDataStatus: exportStatus });
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

    // data from api

    const fetchAndSetInitialData = async (): Promise<void> => {
        setDataIsMounted(false);
        const initialData = await fetchInitialDataService();
        setServerStatus({
            ...serverStatus,
            isolateStatus: initialData.status.isolateStatus,
            filterStatus: initialData.status.filterStatus,
        });

        if (initialData.data) {
            setSubFilters(initialData.data.subFilters);
            setUniqueDataValues(initialData.data.uniqueDataValues);
            setInitialUniqueValues(initialData.data.uniqueDataValues);
            setTotalNrOfIsol(initialData.data.totalNrOfIsolates);
            setDataIsMounted(true);
        }
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
        const allFiltersList = allSubFiltersList.concat(mainFilterList);
        const filterFromPath = getFilterFromPath(
            history.location.search,
            allFiltersList
        );
        let displFilter: string[] = filterFromPath.displayedFilters;
        if (_.isEmpty(filterFromPath.displayedFilters)) {
            displFilter = defaultFilter.displayedFilters;
        }
        setFilter({
            mainFilter: mainFilterList,
            selectedFilter: filterFromPath.selectedFilters,
            displayedFilters: displFilter,
        });
    };

    const handleClickQueriesDialogOpen = (): void => {
        setQueryDialogIsOpen(true);
    };

    const handleCloseQueriesDialog = (): void => {
        setQueryDialogIsOpen(false);
    };

    const handleApplyQuery = (exampleQuery: string): void => {
        const newPath = exampleQuery;
        history.push(newPath);
        setFilterFromPath();
        setTableFromPath();
        setQueryDialogIsOpen(false);
    };

    const fetchIsolateCounted = async (
        uniqueValues: FilterInterface
    ): Promise<void> => {
        setDataIsLoading(true);
        const countedIsolatesResponse: ApiResponse<IsolateCountedDTO> =
            await callApiService(isolateCountUrl);

        setServerStatus({
            ...serverStatus,
            isolateCountStatus: countedIsolatesResponse.status,
        });
        if (countedIsolatesResponse.data !== undefined) {
            const isolateCountProp: IsolateCountedDTO =
                countedIsolatesResponse.data;
            const nrOfSelectedIsolates = isolateCountProp.totalNumberOfIsolates;
            const isolateCountGroups = isolateCountProp.groups;
            if ((!isCol && !isRow) || isolateCountGroups === undefined) {
                setData({
                    ...data,
                    statisticDataAbsolute: [],
                });
            } else {
                const dataObjects = generateDataObjectsService({
                    t,
                    isolateCountGroups,
                    nrOfSelectedIsolates,
                    uniqueValues,
                    isCol,
                    isRow,
                    selectedFilters: filter.selectedFilter,
                    colAttribute,
                    rowAttribute,
                });

                setColumnNameValues(dataObjects.colNames);
                setData({
                    ...data,
                    statisticDataAbsolute: dataObjects.statisticDataAbsolute,
                    statisticDataRelative: dataObjects.statisticDataRelative,
                    statisticDataRelativeChart:
                        dataObjects.statisticDataRelativeChart,
                    statTableDataWithSumsAbs:
                        dataObjects.statTableDataWithSumsAbs,
                    statTableDataWithSumsRel:
                        dataObjects.statTableDataWithSumsRel,
                });
            }
            setNrOfSelectedIsol(nrOfSelectedIsolates);
        }
        setDataIsLoading(false);
    };

    const fetchAndUpdateValues = async (): Promise<void> => {
        setUpdateFilterAndDataIsLoading(true);
        const parameterURL = history.location.search;
        const conditionalFilters = await fetchConditionalFilters({
            parameterURL,
            uniqueValues: uniqueDataValues,
            colAttribute,
            rowAttribute,
            displayedFilters: filter.displayedFilters,
        });

        if (conditionalFilters.status === 200) {
            setUniqueDataValues(conditionalFilters.data);
            await fetchIsolateCounted(conditionalFilters.data);
        } else {
            setUniqueDataValues(initialUniqueValues);
        }

        setServerStatus({
            ...serverStatus,
            filterStatus: conditionalFilters.status,
        });
        setUpdateFilterAndDataIsLoading(false);
    };

    useEffect(() => {
        fetchAndSetInitialData();
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
            fetchAndUpdateValues();
        }
    }, [filter, data.row, data.column, isolateCountUrl]);

    const isLoading = dataIsLoading || updateFilterAndDataIsLoading;

    const subHeaderButtons: JSX.Element[] = [
        <SubHeaderButtonComponent
            onClickOpen={handleClickQueriesDialogOpen}
            dialogIsOpen={queryDialogIsOpen}
            buttonIcon={<QueryStatsIcon fontSize="small" />}
            buttonText={t("Header:ExampleQueries")}
        />,
        <SubHeaderButtonComponent
            onClickOpen={handleClickExportDialogOpen}
            dialogIsOpen={exportDialogIsOpen}
            buttonIcon={<GetAppIcon fontSize="small" />}
            buttonText={t("Header:Export")}
        />,
    ];

    return (
        <LoadingOrErrorComponent
            status={serverStatus}
            dataIsSet={dataIsMounted}
            componentToDisplay={
                <QueryPageLayoutComponent
                    subHeaderButtons={subHeaderButtons}
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
                    queryDialog={
                        <ExampleQueriesDialogComponent
                            loading={loadingIsolates}
                            onClickClose={handleCloseQueriesDialog}
                            onClickExampleQuery={handleApplyQuery}
                        />
                    }
                    queryDialogIsOpen={queryDialogIsOpen}
                />
            }
        />
    );
}
