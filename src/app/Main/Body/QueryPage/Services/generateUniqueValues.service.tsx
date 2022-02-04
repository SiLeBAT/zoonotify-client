import { adaptFilterFromApiService } from "./adaptFilterFromAPI.service";
import {
    ClientFiltersConfig,
    ClientSingleFilterConfig,
    FilterInterface,
} from "../../../../Shared/Model/Filter.model";
import { FilterConfigDTO } from "../../../../Shared/Model/Api_Filter.model";

export function generateUniqueValuesService(
    filterProp: FilterConfigDTO,
    mainFilters: string[],
    subFilters: string[]
): FilterInterface {
    const adaptedDbFilters: ClientFiltersConfig =
        adaptFilterFromApiService(filterProp);

    const uniqueValuesObject: FilterInterface = { filters: {}, subfilters: {} };

    adaptedDbFilters.filters.forEach(
        (filterElement: ClientSingleFilterConfig) => {
            const { id } = filterElement;
            if (mainFilters.includes(id)) {
                uniqueValuesObject.filters[id] = filterElement.values;
            }
            if (subFilters.includes(id)) {
                uniqueValuesObject.subfilters[id] = filterElement.values;
            }
        }
    );

    return uniqueValuesObject;
}
