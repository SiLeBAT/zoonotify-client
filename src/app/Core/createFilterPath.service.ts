import _ from "lodash";
import {
    FilterType,
    FilterInterface,
    mainFilterAttributes,
} from "../Shared/Model/Filter.model";
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
            const filterString: string = _.isEmpty(filter[attribute])
                ? "alle Werte"
                : filter[attribute].join("_");

            newPath += index <= mainFilterAttributes.length - 1 ? "&" : "";
            newPath += setParams(attribute, filterString);
        }
    );
    newPath += getTableParam("row", table.row);
    newPath += getTableParam("column", table.column);

    return newPath;
};
