import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
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
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { TableContext } from "../../../Shared/Context/TableContext";
import { FilterConfigDTO } from "../../../Shared/Model/Api_Filter.model";
import { ClientFilterConfig, ClientSingleFilterConfig, FilterInterface } from "../../../Shared/Model/Filter.model";
import { getFilterFromPath } from "../../../Core/PathServices/getFilterFromPath.service";
import { generatePathString } from "../../../Core/PathServices/generatePathString.service";
import { getFeaturesFromPath } from "../../../Core/PathServices/getTableFromPath.service";
import { QueryPageComponent } from "./QueryPage.component";
import { CheckIfFilterIsSet } from "../../../Core/FilterServices/checkIfFilterIsSet.service";
import { adaptIsolatesFromAPI } from "../../../Core/adaptIsolatesFromAPI.service";

import { adaptFilterFromApiService } from "../../../Core/adaptFilterFromAPI.service";

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
    const state = { isCol, isRow, isFilter };

    const isolateCountUrl: string = ISOLATE_COUNT_URL + history.location.search;

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
            const adaptedDbFilters: ClientFilterConfig = adaptFilterFromApiService(
                filterProp
            );

            const uniqueValuesObject: FilterInterface = {};

            adaptedDbFilters.filters.forEach(
                (filterElement: ClientSingleFilterConfig) => {
                    const { id } = filterElement;
                    uniqueValuesObject[id] = filterElement.values;
                }
            );

            const nrOfSelectedIsolates =
                isolateCountProp.totalNumberOfIsolates;

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
                    isCol={state.isCol}
                    isRow={state.isRow}
                    isFilter={state.isFilter}
                />
            }
        />
    );
}
