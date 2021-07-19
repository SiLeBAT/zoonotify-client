import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import {
    ClientIsolateCountedGroups,
    DbKeyCollection,
} from "../../../Shared/Model/Client_Isolate.model";
import { FILTER_URL, ISOLATE_COUNT_URL } from "../../../Shared/URLs";
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
import { IsolateCountedDTO } from "../../../Shared/Model/Api_Isolate.model";
import { FilterConfigDTO } from "../../../Shared/Model/Api_Filter.model";
import { getCurrentDate } from "../../../Core/getCurrentDate.service";

export function QueryPageContainerComponent(): JSX.Element {
    const [isolateStatus, setIsolateStatus] = useState<number>();
    const [isolateCountStatus, setIsolateCountStatus] = useState<number>();
    const [filterStatus, setFilterStatus] = useState<number>();
    const [columnNameValues, setColumnNameValues] = useState<string[]>([]);
    const [totalNrOfIsol, setTotalNrOfIsol] = useState<number>(0);
    const [nrOfSelectedIsol, setNrOfSelectedIsol] = useState<number>(0);
    const [dataIsLoading, setDataIsLoading] = useState<boolean>(false);
    const [uniqueDataValues, setUniqueDataValues] = useState<FilterInterface>({});


    const { filter, setFilter } = useContext(FilterContext);
    const { data, setData } = useContext(DataContext);

    const history = useHistory();
    const { t } = useTranslation(["QueryPage"]);

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
        const newPath: string = generatePathStringService(
            newFilter.selectedFilter,
            newFilter.mainFilter,
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

    const handleChartDownload = (): void => {
        const znPngFilename = `ZooNotify_chart_${getCurrentDate()}.png`;

        const download = async (): Promise<void> => {
            if (getPngDownloadUriRef.current !== null) {
                const imgURI = await getPngDownloadUriRef.current();
                const a = document.createElement("a");
                a.href = imgURI;
                a.target = "_blank";
                a.download = znPngFilename;
                a.click();
            }
        };

        download();
    };

    const fetchAndSetData = async (): Promise<void> => {
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
            setUniqueDataValues(uniqueValuesObject);
            setTotalNrOfIsol(totalNrOfIsolates);
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
        const filterFromPath = getFilterFromPath(
            history.location.search,
            DbKeyCollection
        );
        let displFilter: string[] = filterFromPath.displayedFilters;
        if (_.isEmpty(filterFromPath.displayedFilters)) {
            displFilter = defaultFilter.displayedFilters;
        }
        setFilter({
            mainFilter: DbKeyCollection,
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

            const allValuesText = t("Results.TableHead");

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
                nrOfSelectedIsolates,
            );
            setColumnNameValues(columnNames);
            setData({
                ...data,
                statisticDataAbsolute: statisticTableDataAbs,
                statisticDataRelative: statisticTableDataRel,
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
            const isolateCountProp: IsolateCountedDTO = countedIsolatesResponse.data;
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
    }, [uniqueDataValues]);

    useEffect((): void => {
        if (!_.isEmpty(uniqueDataValues)) {
            fetchIsolateCounted();
        }
    }, [filter, data.row, data.column, isolateCountUrl]);

    return (
        <LoadingOrErrorComponent
            status={{ isolateStatus, isolateCountStatus, filterStatus }}
            dataIsSet={!_.isEmpty(uniqueDataValues)}
            componentToDisplay={
                <QueryPageLayoutComponent
                    isFilter={isFilter}
                    dataIsLoading={dataIsLoading}
                    columnNameValues={columnNameValues}
                    data={data}
                    numberOfIsolates={{
                        total: totalNrOfIsol,
                        filtered: nrOfSelectedIsol,
                    }}
                    filterInfo={filter}
                    dataUniqueValues={uniqueDataValues}
                    getPngDownloadUriRef={getPngDownloadUriRef}
                    onDisplFeaturesChange={handleChangeDisplFeatures}
                    onDisplFeaturesSwap={handleSwapDisplFeatures}
                    onDisplFeaturesRemoveAll={handleRemoveAllDisplFeatures}
                    onFilterChange={handleChangeFilter}
                    onFilterRemoveAll={handleRemoveAllFilter}
                    onDisplayOptionsChange={handleChangeDisplayOptions}
                    onSubmitFiltersToDisplay={handleSubmitFiltersToDisplay}
                    onDownloadChart={handleChartDownload}
                />
            }
        />
    );
}
