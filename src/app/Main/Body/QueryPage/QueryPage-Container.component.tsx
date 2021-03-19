import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { ValueType } from "react-select";
import { DataContext } from "../../../Shared/Context/DataContext";
import {
    IsolateCountedDTO,
    IsolateDTO,
} from "../../../Shared/Model/Api_Isolate.model";
import {
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
} from "../../../Shared/Context/FilterContext";
import {
    DisplayOptionType,
    TableContext,
    TableType,
} from "../../../Shared/Context/TableContext";
import { FilterConfigDTO } from "../../../Shared/Model/Api_Filter.model";
import {
    ClientFiltersConfig,
    ClientSingleFilterConfig,
    FilterInterface,
    FilterType,
} from "../../../Shared/Model/Filter.model";
import { getFilterFromPath } from "../../../Core/PathServices/getFilterFromPath.service";
import { generatePathString } from "../../../Core/PathServices/generatePathString.service";
import { getFeaturesFromPath } from "../../../Core/PathServices/getTableFromPath.service";
import { QueryPageComponent } from "./QueryPage.component";
import { CheckIfFilterIsSet } from "../../../Core/FilterServices/checkIfFilterIsSet.service";
import { adaptIsolatesFromAPI } from "../../../Core/adaptIsolatesFromAPI.service";
import { adaptFilterFromApiService } from "../../../Core/adaptFilterFromAPI.service";
import { handleChangeDisplayedFeatures } from "./ChangeDisplFeatures.service";
import { changeFilter } from "./ChangeFilter.service";

export function QueryPageContainerComponent(): JSX.Element {
    const [status, setStatus] = useState<{
        isolateStatus: number;
        isolateCountStatus: number;
        filterStatus: number;
    }>();
    const { data, setData } = useContext(DataContext);
    const { filter, setFilter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);
    const history = useHistory();

    const isCol: boolean = table.column !== "";
    const isRow: boolean = table.row !== "";
    const isFilter: boolean = CheckIfFilterIsSet(
        filter.selectedFilter,
        filter.mainFilter
    );

    const isolateCountUrl: string = ISOLATE_COUNT_URL + history.location.search;

    const handleChangeDisplFeatures = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ): void => {
        setTable({
            ...table,
            [keyName]: handleChangeDisplayedFeatures(selectedOption),
        });
    };

    const handleSwapDisplFeatures = (): void => {
        setTable({
            ...table,
            row: table.column,
            column: table.row,
        });
    };

    const handleChangeFilter = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ): void => {
        setFilter({
            ...filter,
            selectedFilter: {
                ...filter.selectedFilter,
                [keyName]: changeFilter(selectedOption),
            },
        });
    };

    const handleRemoveAllFilter = (): void => {
        setFilter({ ...filter, selectedFilter: defaultFilter.selectedFilter });
    };

    const handleRemoveAllDisplFeatures = (): void => {
        setTable({
            ...table,
            row: "" as FilterType,
            column: "" as FilterType,
        });
    };

    const handleRadioChange = (eventTargetValue: string): void => {
        const optionValue = eventTargetValue as DisplayOptionType;
        setTable({
            ...table,
            option: optionValue,
        });
    };

    const fetchAndSetDataAndFilter = async (): Promise<void> => {
        const isolateResponse: Response = await fetch(ISOLATE_URL);
        const filterResponse: Response = await fetch(FILTER_URL);
        const isolateCountResponse: Response = await fetch(isolateCountUrl);

        const isolateStatus = isolateResponse.status;
        const isolateCountStatus = isolateCountResponse.status;
        const filterStatus = filterResponse.status;

        setStatus({
            isolateStatus,
            isolateCountStatus,
            filterStatus,
        });

        if (
            isolateStatus === 200 &&
            isolateCountStatus === 200 &&
            filterStatus === 200
        ) {
            const isolateProp: IsolateDTO = await isolateResponse.json();
            const filterProp: FilterConfigDTO = await filterResponse.json();
            const isolateCountProp: IsolateCountedDTO = await isolateCountResponse.json();

            const adaptedDbIsolates: DbCollection = adaptIsolatesFromAPI(
                isolateProp
            );
            const adaptedDbFilters: ClientFiltersConfig = adaptFilterFromApiService(
                filterProp
            );

            const uniqueValuesObject: FilterInterface = {};

            adaptedDbFilters.filters.forEach(
                (filterElement: ClientSingleFilterConfig) => {
                    const { id } = filterElement;
                    uniqueValuesObject[id] = filterElement.values;
                }
            );

            const nrOfSelectedIsolates = isolateCountProp.totalNumberOfIsolates;

            setData({
                ZNData: adaptedDbIsolates,
                keyValues: DbKeyCollection,
                uniqueValues: uniqueValuesObject,
                nrOfSelectedIsolates,
            });
        }
    };

    useEffect(() => {
        fetchAndSetDataAndFilter();
        const [rowFromPath, colFromPath] = getFeaturesFromPath(
            history.location.search
        );
        setFilter({
            mainFilter: DbKeyCollection,
            selectedFilter: getFilterFromPath(
                history.location.search,
                DbKeyCollection
            ),
        });
        setTable({
            ...table,
            row: rowFromPath,
            column: colFromPath,
        });
    }, []);

    useEffect((): void => {
        history.push(
            `?${generatePathString(
                filter.selectedFilter,
                table,
                filter.mainFilter
            )}`
        );
    }, [filter, table, isolateCountUrl]);

    return (
        <LoadingOrErrorComponent
            status={status}
            dataIsSet={!_.isEmpty(data.ZNData)}
            componentToDisplay={
                <QueryPageComponent
                    isCol={isCol}
                    isRow={isRow}
                    isFilter={isFilter}
                    handleChangeDisplFeatures={handleChangeDisplFeatures}
                    handleSwapDisplFeatures={handleSwapDisplFeatures}
                    handleRemoveAllDisplFeatures={handleRemoveAllDisplFeatures}
                    handleChangeFilter={handleChangeFilter}
                    handleRemoveAllFilter={handleRemoveAllFilter}
                    handleRadioChange={handleRadioChange}
                />
            }
        />
    );
}
