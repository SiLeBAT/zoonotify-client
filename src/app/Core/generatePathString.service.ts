import _ from "lodash";
import {
    FilterType,
    FilterInterface,
} from "../Shared/Model/Filter.model";
import { TableInterface } from "../Shared/Context/TableContext";

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
export const generatePathString = (
    filter: FilterInterface,
    table: TableInterface, 
    mainFilterAttributes: string[]
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
