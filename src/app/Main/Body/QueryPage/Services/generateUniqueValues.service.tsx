import { adaptFilterFromApiService } from "./adaptFilterFromAPI.service";
import {
    ClientFiltersConfig,
    ClientSingleFilterConfig,
    FilterInterface,
} from "../../../../Shared/Model/Filter.model";
import { FilterConfigDTO } from "../../../../Shared/Model/Api_Filter.model";

export function generateUniqueValuesService(
    filterProp: FilterConfigDTO
): FilterInterface {
    const adaptedDbFilters: ClientFiltersConfig = adaptFilterFromApiService(
        filterProp
    );

    const uniqueValuesObject: FilterInterface = {};

    adaptedDbFilters.filters.forEach(
        (filterElement: ClientSingleFilterConfig) => {
            const { id } = filterElement;
            uniqueValuesObject[id] = filterElement.values;
        }
    );

    return uniqueValuesObject;
}
