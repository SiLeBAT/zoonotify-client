import _ from "lodash";
import {
    ClientSingleFilterConfig,
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
    mainFiltersNames: FilterType[],
    subFiltersNames: FilterType[],
    subFilters: ClientSingleFilterConfig[]
): FilterInterface {
    const searchParams = new URLSearchParams(path);
    const filterFromPath: FilterInterface = { filters: {}, subfilters: {} };

    mainFiltersNames.forEach((filterKey) => {
        const filterValues: string[] = searchParams.getAll(filterKey);
        if (!_.isEmpty(filterValues)) {
            filterFromPath.filters[filterKey] = filterValues;
        }
    });
    subFiltersNames.forEach((subFilterKey) => {
        const subFilterValues: string[] = searchParams.getAll(subFilterKey);
        if (!_.isEmpty(subFilterValues)) {
            filterFromPath.subfilters[subFilterKey] = subFilterValues;
        }
    });

    subFilters.forEach((subFilter) => {
        const subFilterTrigger = subFilter.trigger;
        if (
            subFilterTrigger !== undefined &&
            filterFromPath.subfilters[subFilter.id] === undefined &&
            (_.includes(
                filterFromPath.filters.microorganism,
                subFilterTrigger
            ) ||
                _.includes(filterFromPath.filters.matrix, subFilterTrigger))
        ) {
            filterFromPath.subfilters[subFilter.id] = [];
        }
    });

    return filterFromPath;
}
