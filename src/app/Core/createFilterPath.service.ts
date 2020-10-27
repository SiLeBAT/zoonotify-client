import _ from "lodash";
import {
    FilterType,
    FilterInterface,
    mainFilterAttributes,
} from "../Shared/Filter.model";
import { TableInterface } from "../Shared/Context/TableContext";

function setParams(key: string, value: string): string {
    const searchParams = new URLSearchParams();
    searchParams.set(key, value);
    return searchParams.toString();
}

function getTableParam(key: string, value: string): string {
    const tableParam = _.isEmpty(value) ? "" : `&${setParams(key, value)}`;
    return tableParam;
}

export const createPathString = (
    filter: FilterInterface,
    table: TableInterface
): string => {
    let newPath = "";
    mainFilterAttributes.forEach(
        (attribute: FilterType, index: number): void => {
            let filterString = "alle Werte";
            if (!_.isEmpty(filter[attribute])) {
                filterString = filter[attribute].join("_");
            }
            const paramsString: string = setParams(attribute, filterString);
            if (index === mainFilterAttributes.length - 1) {
                newPath = newPath.concat(`${paramsString}`);
            } else {
                newPath = newPath.concat(`${paramsString}&`);
            }
        }
    );

    newPath = newPath.concat(getTableParam("row", table.row));
    newPath = newPath.concat(getTableParam("column", table.column));

    return newPath;
};
