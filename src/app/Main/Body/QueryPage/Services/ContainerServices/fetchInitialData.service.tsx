import {
    ApiResponse,
    callApiService,
} from "../../../../../Core/callApi.service";
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
import {
    allSubFiltersList,
    mainFilterList,
} from "../../../../../Shared/Model/Client_Isolate.model";

export async function fetchInitialDataService(): Promise<{
    status: { filterStatus: number; isolateStatus: number };
    data?: {
        subFilters: ClientSingleFilterConfig[];
        mainFilterWithSubFilters: string[];
        uniqueDataValues: FilterInterface;
        totalNrOfIsolates: number;
    };
}> {
    const isolateResponse: ApiResponse<IsolateCountedDTO> =
        await callApiService(ISOLATE_COUNT_URL);
    const filterResponse: ApiResponse<FilterConfigDTO> = await callApiService(
        FILTER_URL
    );

    if (isolateResponse.data && filterResponse.data) {
        const isolateCountProp: IsolateCountedDTO = isolateResponse.data;

        const totalNrOfIsolates = isolateCountProp.totalNumberOfIsolates;

        const filterProp: FilterConfigDTO = filterResponse.data;

        const uniqueValuesObject: FilterInterface = generateUniqueValuesService(
            filterProp,
            mainFilterList,
            allSubFiltersList
        );

        const adaptedFilterProp: ClientFiltersConfig =
            adaptFilterFromApiService(filterProp);
        const adaptedSubFilters: ClientSingleFilterConfig[] = [];
        const mainFilterWithSubFilters: string[] = [];
        adaptedFilterProp.filters.forEach((adaptedFilter) => {
            const subFilterParent = adaptedFilter.parent;
            if (
                subFilterParent !== undefined &&
                allSubFiltersList.includes(adaptedFilter.id)
            ) {
                if (adaptedFilter.values.length > 1) {
                    adaptedSubFilters.push(adaptedFilter);
                    if (!mainFilterWithSubFilters.includes(subFilterParent)) {
                        mainFilterWithSubFilters.push(subFilterParent);
                    }
                }
            }
        });

        return {
            status: {
                filterStatus: filterResponse.status,
                isolateStatus: isolateResponse.status,
            },
            data: {
                subFilters: adaptedSubFilters,
                mainFilterWithSubFilters,
                uniqueDataValues: uniqueValuesObject,
                totalNrOfIsolates,
            },
        };
    }
    return {
        status: {
            filterStatus: filterResponse.status,
            isolateStatus: isolateResponse.status,
        },
    };
}
