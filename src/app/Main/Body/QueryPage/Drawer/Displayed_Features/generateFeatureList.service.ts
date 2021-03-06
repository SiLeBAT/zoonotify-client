import _ from "lodash";
import { FilterType } from "../../../../../Shared/Model/Filter.model";

/**
 * @desc Makes a list out of the input table values, return empty list if no table values are given.
 * @param tableValue - string of table values
 * @returns {[boolean, FilterType[]]} - true if no tableValues, List of selected values
 */
export function generateFeatureList(
    tableValue: FilterType
): [boolean, FilterType[]] {
    const noValues: boolean = _.isEmpty(tableValue);
    let selectedValuesList: FilterType[] = [tableValue];
    if (noValues) {
        selectedValuesList = [];
    }
    return [noValues, selectedValuesList];
}
