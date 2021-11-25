import { ApiResponse, callApiService } from "../../../../../Core/callApi.service";
import { IsolateCountedDTO } from "../../../../../Shared/Model/Api_Isolate.model";
import { FILTER_URL, ISOLATE_COUNT_URL } from "../../../../../Shared/URLs";
import {
    FilterInterface,
    ClientFiltersConfig,
    ClientSingleFilterConfig,
} from "../../../../../Shared/Model/Filter.model";
import { adaptFilterFromApiService } from "../adaptFilterFromAPI.service";
import { generateUniqueValuesService } from "../generateUniqueValues.service";
import { FilterConfigDTO } from "../../../../../Shared/Model/Api_Filter.model";

export async function initializeDataService(): Promise<{
    filterStatus: number;
    isolateStatus: number;
    subFilters?: ClientSingleFilterConfig[];
    uniqueDataValues?: FilterInterface;
    totalNrOfIsolates?: number;
}> {
    const isolateResponse: ApiResponse<IsolateCountedDTO> = await callApiService(
        ISOLATE_COUNT_URL
    );
    const filterResponse: ApiResponse<FilterConfigDTO> = await callApiService(
        FILTER_URL
    );

    if (isolateResponse.data && filterResponse.data) {
        const isolateCountProp: IsolateCountedDTO = isolateResponse.data;

        const totalNrOfIsolates = isolateCountProp.totalNumberOfIsolates;

        const filterProp: FilterConfigDTO = filterResponse.data;

        const uniqueValuesObject: FilterInterface = generateUniqueValuesService(
            filterProp
        );

        const adaptedFilterProp: ClientFiltersConfig = adaptFilterFromApiService(
            filterProp
        );
        const adaptedSubFilters: ClientSingleFilterConfig[] = [];
        adaptedFilterProp.filters.forEach((adaptedFilter) => {
            if (adaptedFilter.parent !== undefined) {
                adaptedSubFilters.push(adaptedFilter);
            }
        });

        return {
            filterStatus: filterResponse.status,
            isolateStatus: isolateResponse.status,
            subFilters: adaptedSubFilters,
            uniqueDataValues: uniqueValuesObject,
            totalNrOfIsolates,
        };
    }
    return {
        filterStatus: filterResponse.status,
        isolateStatus: isolateResponse.status,
    };
}
