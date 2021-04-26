import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { DataContext } from "../../../Shared/Context/DataContext";
import {
    ClientIsolateCountedGroups,
    DbCollection,
    DbKeyCollection,
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
    TableContext,
    TableInterface,
    TableType,
} from "../../../Shared/Context/TableContext";
import {
    FilterInterface,
    FilterType,
} from "../../../Shared/Model/Filter.model";
import { getFilterFromPath } from "./QueryPageServices/PathServices/getFilterFromPath.service";
import { generatePathStringService } from "./QueryPageServices/PathServices/generatePathString.service";
import { QueryPageLayoutComponent } from "./QueryPage-Layout.component";
import { CheckIfFilterIsSet } from "./QueryPageServices/checkIfFilterIsSet.service";
import { chooseSelectedDisplayedFeaturesService } from "./QueryPageServices/SelectorServices/chooseSelectedDisplFeatures.service";
import { chooseSelectedFiltersService } from "./QueryPageServices/SelectorServices/chooseSelectedFilters.service";
import { calculateRelativeTableData } from "./QueryPageServices/TableServices/calculateRelativeTableData.service";
import { adaptCountedIsolatesGroupsService } from "./QueryPageServices/adaptCountedIsolatesGroups.service";
import { generateTableHeaderValuesService } from "./QueryPageServices/TableServices/generateTableHeaderValues.service";
import { generateStatisticTableDataAbsService } from "./QueryPageServices/TableServices/generateStatisticTableDataAbs.service";
import { getFeaturesFromPath } from "./QueryPageServices/PathServices/getTableFromPath.service";
import { ApiResponse, callApiService } from "../../../Core/callApi.service";
import { adaptIsolatesFromAPI } from "../../../Shared/adaptIsolatesFromAPI.service";
import { generateUniqueValuesService } from "./QueryPageServices/generateUniqueValues.service";
import {
    IsolateCountedDTO,
    IsolateDTO,
} from "../../../Shared/Model/Api_Isolate.model";
import { FilterConfigDTO } from "../../../Shared/Model/Api_Filter.model";

export function QueryPageContainerComponent(): JSX.Element {
    const [isolateStatus, setIsolateStatus] = useState<number>();
    const [isolateCountStatus, setIsolateCountStatus] = useState<number>();
    const [filterStatus, setFilterStatus] = useState<number>();
    const [columnNameValues, setColumnNameValues] = useState<string[]>([]);
    const [nrOfSelectedIsol, setNrOfSelectedIsol] = useState<number>(0);

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

    const totalNrOfIsol: number = data.ZNData.length;

    const isolateCountUrl: string = ISOLATE_COUNT_URL + history.location.search;

    const handleChangeDisplFeatures = (
        selectedOption: { value: string; label: string } | null,
        keyName: FilterType | TableType
    ): void => {
        const newTable: TableInterface = {
            ...table,
            [keyName]: chooseSelectedDisplayedFeaturesService(selectedOption),
        };
        const newPath: string = generatePathStringService(filter, newTable);
        history.push(newPath);
        setTable(newTable);
    };

    const handleSwapDisplFeatures = (): void => {
        const newTable: TableInterface = {
            ...table,
            row: table.column,
            column: table.row,
        };
        const newPath: string = generatePathStringService(filter, newTable);
        history.push(newPath);
        setTable(newTable);
    };

    const handleRemoveAllDisplFeatures = (): void => {
        const newTable: TableInterface = {
            ...table,
            row: "" as FilterType,
            column: "" as FilterType,
        };
        const newPath: string = generatePathStringService(filter, newTable);
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
        const newPath: string = generatePathStringService(newFilter, table);
        history.push(newPath);
        setFilter(newFilter);
    };

    const handleRemoveAllFilter = (): void => {
        const newFilter: FilterContextInterface = {
            ...filter,
            selectedFilter: defaultFilter.selectedFilter,
        };
        const newPath: string = generatePathStringService(newFilter, table);
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

    const handleClickSubmit = (filterToDisplay: string[]): void => {
        setFilter({ ...filter, displayedFilter: filterToDisplay });
    };

    const fetchAndSetData = async (): Promise<void> => {
        const isolateResponse: ApiResponse<IsolateDTO> = await callApiService(ISOLATE_URL);
        const filterResponse: ApiResponse<FilterConfigDTO> = await callApiService(FILTER_URL);

        setIsolateStatus(isolateResponse.status);
        setFilterStatus(filterResponse.status);

        if (isolateResponse.data && filterResponse.data) {
            const isolateProp: IsolateDTO = isolateResponse.data;
            const filterProp: FilterConfigDTO = filterResponse.data;

            const adaptedDbIsolates: DbCollection = adaptIsolatesFromAPI(
                isolateProp
            );
            const uniqueValuesObject: FilterInterface = generateUniqueValuesService(
                filterProp
            );
            setData({
                ZNData: adaptedDbIsolates,
                uniqueValues: uniqueValuesObject,
            });
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
        setFilter({
            ...filter,
            mainFilter: DbKeyCollection,
            selectedFilter: filterFromPath,
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
                nrOfSelectedIsolates
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
        const tableResponse: ApiResponse<IsolateCountedDTO> = await callApiService(isolateCountUrl);

        setIsolateCountStatus(tableResponse.status);

        if (tableResponse.data !== undefined) {
            const isolateCountProp: IsolateCountedDTO = tableResponse.data;
            const nrOfSelectedIsolates = isolateCountProp.totalNumberOfIsolates;
            const isolateCountGroups = isolateCountProp.groups;
            setTableContext(isolateCountGroups, nrOfSelectedIsolates);
            setNrOfSelectedIsol(nrOfSelectedIsolates);
        }
    };

    useEffect(() => {
        fetchAndSetData();
    }, []);

    useEffect(() => {
        setTableFromPath();
        setFilterFromPath();
    }, [data.uniqueValues]);

    useEffect((): void => {
        if (!_.isEmpty(data.uniqueValues)) {
            fetchIsolateCounted();
        }
    }, [
        filter,
        table.row,
        table.column,
        isolateCountUrl,
        localStorage.getItem("i18nextLng"),
    ]);

    return (
        <LoadingOrErrorComponent
            status={{ isolateStatus, isolateCountStatus, filterStatus }}
            dataIsSet={!_.isEmpty(data.ZNData)}
            componentToDisplay={
                <QueryPageLayoutComponent
                    isCol={isCol}
                    isRow={isRow}
                    isFilter={isFilter}
                    columnNameValues={columnNameValues}
                    tableData={table}
                    numberOfIsolates={{
                        total: totalNrOfIsol,
                        filtered: nrOfSelectedIsol,
                    }}
                    filterInfo={filter}
                    dataUniqueValues={data.uniqueValues}
                    onDisplFeaturesChange={handleChangeDisplFeatures}
                    onDisplFeaturesSwap={handleSwapDisplFeatures}
                    onDisplFeaturesRemoveAll={handleRemoveAllDisplFeatures}
                    onFilterChange={handleChangeFilter}
                    onFilterRemoveAll={handleRemoveAllFilter}
                    onDisplayOptionsChange={handleChangeDisplayOptions}
                    onSubmitClick={handleClickSubmit}
                />
            }
        />
    );
}
