import _ from "lodash";
import { FilterInterface, FilterType } from "../../../../Shared/Model/Filter.model";

/**
 * @desc Check if one of all possible filters is selected
 * @param filter - object of filters
 * @param mainFilterAttributes - list with all main filters
 * @returns {boolean} - true if a filter is selected
 */
export function CheckIfFilterIsSet(
    filter: FilterInterface,
    mainFilterAttributes: string[]
): boolean {
    const isFilter = !mainFilterAttributes.every((key) =>
        _.isEmpty(filter[key])
    );
    return isFilter;
}

/**
 * @desc Check if a specific filter is selected
 * @param filter - object of filters
 * @param attribute - specific filter attribute
 * @returns {boolean} - true if the specific filter is not selected
 */
export function CheckIfSingleFilterIsSet(
    filter: FilterInterface,
    attribute: FilterType
): boolean {
    const noFilter = _.isEmpty(filter[attribute]);
    return noFilter;
}
