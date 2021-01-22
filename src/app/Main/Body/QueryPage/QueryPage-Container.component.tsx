import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { DataContext } from "../../../Shared/Context/DataContext";
import { DBentry, DBkey } from "../../../Shared/Model/Isolate.model";
import { mockDataURL } from "../../../Shared/URLs";
import { QueryPageComponent } from "./QueryPage.component";
import {
    FilterInterface,
} from "../../../Shared/Model/Filter.model";
import {
    FilterContext,
} from "../../../Shared/Context/FilterContext";
import { TableContext } from "../../../Shared/Context/TableContext";
import { getFilterFromPath } from "../../../Core/getFilterFromPath.service";
import { generatePathString } from "../../../Core/generatePathString.service";
import { getFeaturesFromPath } from "../../../Core/getTableFromPath.service";

export function QueryPageContainerComponent(): JSX.Element {
    const { data, setData } = useContext(DataContext);
    const { filter, setFilter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);
    const history = useHistory();

    const BASE_URL: string = mockDataURL;

    const getData = async (): Promise<void> => {
        const r: Response = await fetch(BASE_URL);
        const dataProp: DBentry[] = await r.json();
        const keyValueProps = Object.keys(dataProp[0]) as DBkey[];

        const uniqueValuesObject: FilterInterface = {};

        filter.mainFilter.forEach((filterElement) => {
            const uniqueValuesPerElement: string[] = _.uniq(
                _.map(dataProp, filterElement)
            );
            uniqueValuesObject[filterElement] = uniqueValuesPerElement;
        });

        setData({
            ZNData: dataProp,
            ZNDataFiltered: dataProp,
            keyValues: keyValueProps,
            uniqueValues: uniqueValuesObject,
        });
    };

    useEffect(() => {
        getData();
        setFilter({
            ...filter,
            selectedFilter: getFilterFromPath(history.location.search, filter.mainFilter)
        });
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
        history.push(`?${generatePathString(filter.selectedFilter, table, filter.mainFilter)}`);
    }, [filter, table]);

    let returnValue = <p> Loading data ... </p>;
    if (_.isEmpty(data.ZNData) === false) {
        returnValue = <QueryPageComponent />;
    }

    return returnValue;
}
