import { FilterConfigDTO } from "../../../../Shared/Model/Api_Filter.model";
import { ClientFiltersConfig } from "../../../../Shared/Model/Filter.model";

/**
 * @desc transform the sampling year inside filterProp.values from Date into string[]
 * @param filterProp -
 * @returns {ClientFiltersConfig}
 */
export function adaptFilterFromApiService(
    filterProp: FilterConfigDTO
): ClientFiltersConfig {
    const adaptedFilters: ClientFiltersConfig = {
        filters: filterProp.filters.map(({ id, name, parent, target, values }) => ({
            id,
            name,
            parent,
            target,
            values: (values as Array<string | Date>).map((element) =>
                String(element)
            ),
        })),
    };

    return adaptedFilters;
}
