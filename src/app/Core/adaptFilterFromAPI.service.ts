import { FilterConfigDTO } from "../Shared/Model/Api_Filter.model";
import { ClientFilterConfig } from "../Shared/Model/Filter.model";

/**
 * @desc transform the sampling year inside filterProp.values from Date into string[]
 * @param {FilterConfigDTO} filterProp - 
 * @returns {ClientFilterConfig} 
 */
export function adaptFilterFromApiService(
    filterProp: FilterConfigDTO
): ClientFilterConfig {
    const adaptedFilters: ClientFilterConfig = {filters: filterProp.filters.map(
        ({ id, name, parent, values }) => ({
            id,
            name,
            parent,
            values: values.join().split(','),
        })
    )};

    return adaptedFilters;
}