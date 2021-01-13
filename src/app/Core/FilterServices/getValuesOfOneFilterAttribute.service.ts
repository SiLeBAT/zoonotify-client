import _ from "lodash";
import { FilterType, FilterInterface } from "../../Shared/Model/Filter.model";

/**
 * @desc Get the unique values of one filter attribute. If filters are selected, only return the selected unique values.
 * @param {FilterType} attribute - on specific filter attribute 
 * @param {FilterInterface} uniqueValues - object of unique values of every filter attribute
 * @param {FilterInterface} filter - object of selected filters
 * @returns {string[]} - corresponding unique values to the filter attribute
 */
export function getValuesOfOneFilterAttribute(
    attribute: FilterType,
    uniqueValues: FilterInterface,
    filter: FilterInterface
): string[] {
    let values = uniqueValues[attribute];
    if (!_.isEmpty(filter[attribute])) {
        values = filter[attribute];
    }
    return values;
}
