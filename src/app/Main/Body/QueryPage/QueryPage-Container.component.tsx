import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { DataContext } from "../../../Shared/Context/DataContext";
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
    TableContext,
    TableInterface,
    TableType,
} from "../../../Shared/Context/TableContext";
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
    const [tableIsLoading, setTableIsLoading] = useState<boolean>(false);

    const { data, setData } = useContext(DataContext);
    const { filter, setFilter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);

    const history = useHistory();
    const { t } = useTranslation(["QueryPage"]);

    const isCol: boolean = table.column !== "";
    const isRow: boolean = table.row !== "";
    const isFilter: boolean = CheckIfFilterIsSet(
        filter.selectedFilter,
        filter.mainFilter
    );
    const rowAttribute: FilterType = table.row;
    const colAttribute: FilterType = table.column;

    const isolateCountUrl: string = ISOLATE_COUNT_URL + history.location.search;

    const getPngDownloadUriRef = useRef<(() => Promise<string>) | null>(null);

    const handleChangeDisplFeatures = (
        selectedOption: { value: string; label: string } | null,
        keyName: FilterType | TableType
    ): void => {
        setTableIsLoading(true);
        const newTable: TableInterface = {
            ...table,
            [keyName]: chooseSelectedDisplayedFeaturesService(selectedOption),
        };
        const newPath: string = generatePathStringService(
            filter.selectedFilter,
            filter.mainFilter,
            newTable
        );
        history.push(newPath);
        setTable(newTable);
    };

    const handleSwapDisplFeatures = (): void => {
        setTableIsLoading(true);
        const newTable: TableInterface = {
            ...table,
            row: table.column,
            column: table.row,
        };
        const newPath: string = generatePathStringService(
            filter.selectedFilter,
            filter.mainFilter,
            newTable
        );
        history.push(newPath);
        setTable(newTable);
    };

    const handleRemoveAllDisplFeatures = (): void => {
        const newTable: TableInterface = {
            ...table,
            row: "" as FilterType,
            column: "" as FilterType,
        };
        const newPath: string = generatePathStringService(
            filter.selectedFilter,
            filter.mainFilter,
            newTable
        );
        history.push(newPath);
        setTable(newTable);
    };

    const handleChangeFilter = (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | TableType
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
            table
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
            table
        );
        history.push(newPath);
        setFilter(newFilter);
    };

    const handleChangeDisplayOptions = (displayOption: string): void => {
        const optionValue = displayOption as DisplayOptionType;
        setTable({
            ...table,
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
            table
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
            setData({
                uniqueValues: uniqueValuesObject,
            });
            setTotalNrOfIsol(totalNrOfIsolates);
        }
    };

    const setTableFromPath = (): void => {
        const [rowFromPath, colFromPath] = getFeaturesFromPath(
            history.location.search
        );
        setTable({
            ...table,
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

    const setTableContext = (
        isolateCountGroups:
            | (Record<string, string | Date> & {
                  count: number;
              })[]
            | undefined,
        nrOfSelectedIsolates: number
    ): void => {
        if ((!isCol && !isRow) || isolateCountGroups === undefined) {
            setTable({
                ...table,
                statisticDataAbsolute: [],
            });
        } else {
            const adaptedIsolateCountGroups: ClientIsolateCountedGroups = adaptCountedIsolatesGroupsService(
                isolateCountGroups
            );

            const allValuesText = t("Results.TableHead");
            const allValuesTextRelative = t("Results.TableHeadRelative");

            const columnNames = generateTableHeaderValuesService(
                isCol,
                allValuesText,
                data.uniqueValues,
                filter.selectedFilter,
                colAttribute
            );
            const statisticTableDataAbs: Record<
                string,
                string
            >[] = generateStatisticTableDataAbsService(
                isRow,
                data.uniqueValues,
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
                allValuesTextRelative,
                isRow
            );
            setColumnNameValues(columnNames);
            setTable({
                ...table,
                statisticDataAbsolute: statisticTableDataAbs,
                statisticDataRelative: statisticTableDataRel,
            });
        }
    };

    const fetchIsolateCounted = async (): Promise<void> => {
        setTableIsLoading(true);
        const tableResponse: ApiResponse<IsolateCountedDTO> = await callApiService(
            isolateCountUrl
        );

        setIsolateCountStatus(tableResponse.status);

        if (tableResponse.data !== undefined) {
            const isolateCountProp: IsolateCountedDTO = tableResponse.data;
            const nrOfSelectedIsolates = isolateCountProp.totalNumberOfIsolates;
            const isolateCountGroups = isolateCountProp.groups;
            setTableContext(isolateCountGroups, nrOfSelectedIsolates);
            setNrOfSelectedIsol(nrOfSelectedIsolates);
        }
        setTableIsLoading(false);
    };

    useEffect(() => {
        fetchAndSetData();
        return () => {
            setTable({ ...table, row: "", column: "" });
        };
    }, []);

    useEffect(() => {
        setTableFromPath();
        setFilterFromPath();
    }, [data.uniqueValues]);

    useEffect((): void => {
        if (!_.isEmpty(data.uniqueValues)) {
            fetchIsolateCounted();
        }
    }, [filter, table.row, table.column, isolateCountUrl]);

    return (
        <LoadingOrErrorComponent
            status={{ isolateStatus, isolateCountStatus, filterStatus }}
            dataIsSet={!_.isEmpty(data.uniqueValues)}
            componentToDisplay={
                <QueryPageLayoutComponent
                    displayRowCol={{ isCol, isRow }}
                    isFilter={isFilter}
                    tableIsLoading={tableIsLoading}
                    columnNameValues={columnNameValues}
                    tableData={table}
                    numberOfIsolates={{
                        total: totalNrOfIsol,
                        filtered: nrOfSelectedIsol,
                    }}
                    filterInfo={filter}
                    dataUniqueValues={data.uniqueValues}
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
