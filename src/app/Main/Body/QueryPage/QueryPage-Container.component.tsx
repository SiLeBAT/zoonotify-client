import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { DataContext } from "../../../Shared/Context/DataContext";
import {
    DBkey,
    IsolateApiInterface,
} from "../../../Shared/Model/Isolate.model";
import { filterURL, isolateURL } from "../../../Shared/URLs";
import { QueryPageComponent } from "./QueryPage.component";
import {
    FilterConfigApiInterface,
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

    const BASE_URL: string = isolateURL;
    const FILTER_URL: string = filterURL;

    const getData = async (): Promise<void> => {
        const isolateResponse: Response = await fetch(BASE_URL);
        const isolateProp: IsolateApiInterface = await isolateResponse.json();
        const keyValueProps = Object.keys(isolateProp.isolates[0]) as DBkey[];

        const filterResponse: Response = await fetch(FILTER_URL);
        const filterProp: FilterConfigApiInterface = await filterResponse.json();

        const mainFilter: FilterType[] = [];
        const uniqueValuesObject: FilterInterface = {};
        const emptyFilter = {} as FilterInterface;

        filterProp.filters.forEach((filterElement) => {
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
            ZNData: isolateProp.isolates,
            ZNDataFiltered: isolateProp.isolates,
            keyValues: keyValueProps,
            uniqueValues: uniqueValuesObject,
        });
    };

    useEffect(() => {
        getData();
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
