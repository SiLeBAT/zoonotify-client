import _ from "lodash";
import {
    FilterInterface,
    FilterType,
    mainFilterAttributes,
} from "../../Shared/Model/Filter.model";

/**
 * @desc Check if one of all possible filters is selected
 * @param {FilterInterface} filter - object of filters
 * @returns {boolean} - true if no filter is selected
 */
export function CheckIfFilterIsSet(filter: FilterInterface): boolean {
    const noFilter = mainFilterAttributes.every(function emptyArray(
        key
    ): boolean {
        const empty: boolean = _.isEmpty(filter[key]);
        return empty;
    });

    return noFilter;
}

/**
 * @desc Check if a specific filter is selected
 * @param {FilterInterface} filter - object of filters
 * @param {FilterType} attribute - specific filter attribute
 * @returns {boolean} - true if the specific filter is not selected
 */
export function CheckIfSingleFilterIsSet(
    filter: FilterInterface,
    attribute: FilterType
): boolean {
    const noFilter = _.isEmpty(filter[attribute]);
    return noFilter;
}
