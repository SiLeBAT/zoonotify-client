import _ from "lodash";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import { DataInterface } from "../../../../../Shared/Context/DataContext";

/**
 * @desc Generate partial path containing the selected filter
 * @param key - filter attribute
 * @param value - corresponding filter value
 * @returns {string} - partial path one main filter
 */
function setParams(key: string, value: string): string {
    const searchParams = new URLSearchParams();
    searchParams.set(key, value);
    return searchParams.toString();
}

/**
 * @desc Generate partial path containing the selected row/column
 * @param key - "row" or "column"
 * @param value - corresponding value to the row or column
 * @returns {string} - partial path for row or column
 */
function getTableParam(key: string, value: string): string {
    const tableParam = _.isEmpty(value) ? "" : `&${setParams(key, value)}`;
    return tableParam;
}

function getFilterString(
    filters: Record<FilterType, string[]>,
    isFirst: boolean
): string {
    let pathString = "";
    let isFirstAttributeWithValue = isFirst;

    Object.keys(filters).forEach((attribute: FilterType): void => {
        if (!_.isEmpty(filters[attribute])) {
            pathString += isFirstAttributeWithValue ? "" : "&";
            filters[attribute].forEach((filterValue, i) => {
                pathString += i === 0 ? "" : "&";
                pathString += setParams(attribute, filterValue);
            });
            isFirstAttributeWithValue = false;
        }
    });
    return pathString;
}

/**
 * @desc Convert selected filter and row/column to URL-Path
 * @param filter - object of selected filters
 * @param table - object of selected row/column
 * @returns {string} - path including selected filters and row/column
 */
export const generatePathStringService = (
    selectedFilter: FilterInterface,
    table: DataInterface
): string => {
    let newPath = "?";

    newPath += getFilterString(selectedFilter.filters, true);
    newPath += getFilterString(selectedFilter.subfilters, false);

    newPath += getTableParam("row", table.row);
    newPath += getTableParam("column", table.column);

    return newPath;
};
