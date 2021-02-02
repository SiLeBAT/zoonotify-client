import { FilterInterface, FilterType } from "../Shared/Model/Filter.model";

/**
 * @desc Extract the selected filter from the given URL path
 * @param {string} path - URL path
 * @param {FilterType[]} filterKeys - list of possible filter attributes
 * @returns {FilterInterface} - object with the filter form the URL path
 */
export function getFilterFromPath(
    path: string,
    filterKeys: FilterType[]
): FilterInterface {
    const searchParams = new URLSearchParams(path);
    const filterFromPath: FilterInterface = {};

    filterKeys.forEach((filterKey) => {
        const filterValues: string[] = searchParams.getAll(filterKey)
        if (filterValues[0] === "alle Werte") {
            filterFromPath[filterKey] = [];
        } else {
            filterFromPath[filterKey] = filterValues;
        }
    });

    return filterFromPath;
}
