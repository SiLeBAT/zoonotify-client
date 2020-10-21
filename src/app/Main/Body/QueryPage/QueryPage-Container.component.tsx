import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { DataContext } from "../../../Shared/Context/DataContext";
import { DBentry, DBtype } from "../../../Shared/Isolat.model";
import { mockDataURL } from "../../../Shared/URLs";
import { QueryPageComponent as QPComp } from "./QueryPage.component";
import {
    FilterInterface,
    mainFilterAttributes,
} from "../../../Shared/Filter.model";
import {
    defaultFilter,
    FilterContext,
} from "../../../Shared/Context/FilterContext";
import { getFilterFromPath } from "../../../Core/getFilterFromPath.service";
import { createPathString } from "../../../Core/createFilterPath.service";

export function QueryPageContainer(): JSX.Element {
    const { data, setData } = useContext(DataContext);
    const { filter, setFilter } = useContext(FilterContext);
    const history = useHistory();
    const BASE_URL: string = mockDataURL;

    const getData = async (): Promise<void> => {
        const r: Response = await fetch(BASE_URL);
        const dataProp: DBentry[] = await r.json();
        const keyValueProps = Object.keys(dataProp[0]) as DBtype[]
        const uniqueValuesObject: FilterInterface = { ...defaultFilter };

        mainFilterAttributes.forEach((filterElement) => {
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
        setFilter(
            getFilterFromPath(history.location.search, mainFilterAttributes)
        );
    }, []);

    useEffect((): void => {
        history.push(`?${createPathString(filter)}`);
    }, [filter]);

    let returnValue = <h1> Loading data ... </h1>;
    if (_.isEmpty(data.ZNData) === false) {
        returnValue = <QPComp />;
    }

    return returnValue;
}
