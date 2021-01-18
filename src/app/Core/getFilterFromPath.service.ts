import { FilterInterface, FilterType } from "../Shared/Model/Filter.model";
import { defaultFilter } from "../Shared/Context/FilterContext";

/**
 * @desc Split the URL path filter string to a list of filters
 * @param {string | null} filterParameter - URL path filter string
 * @returns {string[]} - list of filters from the URL path
 */
function getFilterList(filterParameter: string | null): string[] {
    const filterList: string[] =
        filterParameter !== null &&
        filterParameter !== "" &&
        filterParameter !== "alle Werte"
            ? filterParameter.split("_")
            : [];
    return filterList;
}

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
    const filterFromPath: FilterInterface = { ...defaultFilter };

    filterKeys.forEach((filterElement) => {
        const paramsOfKey: string[] = getFilterList(
            searchParams.get(filterElement)
        );
        filterFromPath[filterElement] = paramsOfKey;
    });

    return filterFromPath;
}
