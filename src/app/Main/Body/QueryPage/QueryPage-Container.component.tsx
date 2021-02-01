import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { DataContext } from "../../../Shared/Context/DataContext";
import { IsolateDTO } from "../../../Shared/Model/Api_Isolate.model";
import {
    DbCollection,
    DbKeyCollection,
} from "../../../Shared/Model/Client_Isolate.model";
import { filterURL, isolateURL } from "../../../Shared/URLs";
import { QueryPageComponent } from "./QueryPage.component";
import {
    FilterConfigDTO,
    FilterInterface,
    FilterType,
    SingleFilterConfig,
} from "../../../Shared/Model/Filter.model";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { TableContext } from "../../../Shared/Context/TableContext";
import { getFilterFromPath } from "../../../Core/getFilterFromPath.service";
import { generatePathString } from "../../../Core/generatePathString.service";
import { getFeaturesFromPath } from "../../../Core/getTableFromPath.service";

function setAdaptedFilterProp(
    filterObj: SingleFilterConfig,
    idName: string
): SingleFilterConfig {
    const adaptedFilterProp = {
        id: idName,
        name: idName,
        parent: filterObj.parent,
        values: filterObj.values,
    };
    return adaptedFilterProp;
}

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

        const adaptedFilterProp: SingleFilterConfig[] = filterProp.filters.map(
            (filterObj) => {
                if (filterObj.id === "sContext") {
                    return setAdaptedFilterProp(filterObj, "samplingContext");
                }
                return setAdaptedFilterProp(filterObj, filterObj.id);
            }
        );

        const mainFilter: FilterType[] = [];
        const uniqueValuesObject: FilterInterface = {};

        adaptedFilterProp.forEach((filterElement) => {
            const { name } = filterElement;
            mainFilter.push(name);
            uniqueValuesObject[name] = filterElement.values;
        });

        setFilter({
            mainFilter,
            selectedFilter: getFilterFromPath(
                history.location.search,
                mainFilter
            ),
        });

        setData({
            ZNData: adaptedDbIsolates,
            ZNDataFiltered: adaptedDbIsolates,
            keyValues: DbKeyCollection,
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
