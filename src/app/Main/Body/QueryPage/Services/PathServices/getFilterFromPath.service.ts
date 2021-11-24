import _ from "lodash";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";

/**
 * @desc Extract the selected filter from the given URL path
 * @param path - URL path
 * @param filterKeys - list of possible filter attributes
 * @returns {FilterInterface} - object with the filter form the URL path
 */
export function getFilterFromPath(
    path: string,
    filterKeys: FilterType[]
): {
    selectedFilters: FilterInterface;
    displayedFilters: string[];
} {
    const searchParams = new URLSearchParams(path);
    const filterFromPath: FilterInterface = {};
    const displFilterFromPath: string[] = [];

    filterKeys.forEach((filterKey) => {
        const filterValues: string[] = searchParams.getAll(filterKey);
        filterFromPath[filterKey] = filterValues;
        if (!_.isEmpty(filterValues)) {
            displFilterFromPath.push(filterKey);
        }
    });

    return {
        selectedFilters: filterFromPath,
        displayedFilters: displFilterFromPath,
    };
}
