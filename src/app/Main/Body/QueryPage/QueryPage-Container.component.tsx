import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { DataContext } from "../../../Shared/Context/DataContext";
import { IsolateDTO } from "../../../Shared/Model/Api_Isolate.model";
import {
    DbCollection,
    DbValues,
} from "../../../Shared/Model/Client_Isolate.model";
import { filterURL, isolateURL } from "../../../Shared/URLs";
import { QueryPageComponent } from "./QueryPage.component";
import {
    FilterConfigDTO,
    FilterInterface,
    FilterType,
} from "../../../Shared/Model/Filter.model";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { TableContext } from "../../../Shared/Context/TableContext";
import { getFilterFromPath } from "../../../Core/getFilterFromPath.service";
import { generatePathString } from "../../../Core/generatePathString.service";
import { getFeaturesFromPath } from "../../../Core/getTableFromPath.service";

export function QueryPageContainerComponent(): JSX.Element {
    const { data, setData } = useContext(DataContext);
    const { filter, setFilter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);
    const history = useHistory();

    const ISOLATE_URL: string = isolateURL;
    const FILTER_URL: string = filterURL;

    const fetchAndSetDataAndFilter = async (): Promise<void> => {
        const isolateResponse: Response = await fetch(ISOLATE_URL);
        const isolateProp: IsolateDTO = await isolateResponse.json();

        const adaptedDbIsolates: DbCollection = isolateProp.isolates.map(
            ({ microorganism, samplingContext, matrix }) => ({
                microorganism,
                samplingContext,
                matrix,
            })
        );

        const filterResponse: Response = await fetch(FILTER_URL);
        const filterProp: FilterConfigDTO = await filterResponse.json();

        const adaptedFilterProp = filterProp.filters.map((filterObj) => {
            const tempFilterProp = { ...filterObj };
            if (tempFilterProp.id === "sContext") {
                tempFilterProp.id = "samplingContext";
                tempFilterProp.name = "samplingContext";
            }
            return tempFilterProp;
        });

        const mainFilter: FilterType[] = [];
        const uniqueValuesObject: FilterInterface = {};
        const emptyFilter: FilterInterface = {};

        adaptedFilterProp.forEach((filterElement) => {
            const { name } = filterElement;
            mainFilter.push(name);
            uniqueValuesObject[name] = filterElement.values;
            emptyFilter[name] = [];
        });

        setFilter({
            mainFilter,
            selectedFilter: getFilterFromPath(
                history.location.search,
                mainFilter
            ),
            emptyFilter,
        });

        setData({
            ZNData: adaptedDbIsolates,
            ZNDataFiltered: adaptedDbIsolates,
            keyValues: DbValues,
            uniqueValues: uniqueValuesObject,
        });
    };

    useEffect(() => {
        fetchAndSetDataAndFilter();
        const [rowFromPath, colFromPath] = getFeaturesFromPath(
            history.location.search
        );
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
    }, [filter, table]);

    let returnValue = <p> Loading data ... </p>;
    if (_.isEmpty(data.ZNData) === false) {
        returnValue = <QueryPageComponent />;
    }

    return returnValue;
}
