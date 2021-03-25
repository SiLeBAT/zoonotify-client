import _ from "lodash";
import { FilterType } from "../../Shared/Model/Filter.model";
import { TableInterface } from "../../Shared/Context/TableContext";
import { FilterContextInterface } from "../../Shared/Context/FilterContext";

/**
 * @desc Generate partial path containing the selected filter
 * @param {string} key - filter attribute
 * @param {string} value - corresponding filter value
 * @returns {string} - partial path one main filter
 */
function setParams(key: string, value: string): string {
    const searchParams = new URLSearchParams();
    searchParams.set(key, value);
    return searchParams.toString();
}

/**
 * @desc Generate partial path containing the selected row/column
 * @param {string} key - "row" or "column"
 * @param {string} value - corresponding value to the row or column
 * @returns {string} - partial path for row or column
 */
function getTableParam(key: string, value: string): string {
    const tableParam = _.isEmpty(value) ? "" : `&${setParams(key, value)}`;
    return tableParam;
}

/**
 * @desc Convert selected filter and row/column to URL-Path
 * @param {FilterInterface} filter - object of selected filters
 * @param {TableInterface} table - object of selected row/column
 * @returns {string} - path including selected filters and row/column
 */
export const generatePathStringService = (
    filter: FilterContextInterface,
    table: TableInterface,
): string => {
    let newPath = "?";
    const {selectedFilter} = filter
    const mainFilterAttributes: string[] = filter.mainFilter
    let isFirstAttributeWithValue = true
    mainFilterAttributes.forEach(
        (attribute: FilterType): void => {
            if (!_.isEmpty(selectedFilter[attribute])) {
                newPath += isFirstAttributeWithValue ? "" : "&";
                selectedFilter[attribute].forEach((filterValue, i) => {
                    newPath += i === 0 ? "" : "&";
                    newPath += setParams(attribute, filterValue);
                });
                isFirstAttributeWithValue = false
            }
        }
    );
    newPath += getTableParam("row", table.row);
    newPath += getTableParam("column", table.column);

    return newPath;
};
