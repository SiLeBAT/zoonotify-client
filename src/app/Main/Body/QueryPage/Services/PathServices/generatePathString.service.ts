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

/**
 * @desc Convert selected filter and row/column to URL-Path
 * @param filter - object of selected filters
 * @param table - object of selected row/column
 * @returns {string} - path including selected filters and row/column
 */
export const generatePathStringService = (
    selectedFilter: FilterInterface,
    mainFilters: string[],
    table: DataInterface
): string => {
    let newPath = "?";
    let isFirstAttributeWithValue = true;
    mainFilters.forEach((attribute: FilterType): void => {
        if (!_.isEmpty(selectedFilter[attribute])) {
            newPath += isFirstAttributeWithValue ? "" : "&";
            selectedFilter[attribute].forEach((filterValue, i) => {
                newPath += i === 0 ? "" : "&";
                newPath += setParams(attribute, filterValue);
            });
            isFirstAttributeWithValue = false;
        }
    });
    newPath += getTableParam("row", table.row);
    newPath += getTableParam("column", table.column);

    return newPath;
};
