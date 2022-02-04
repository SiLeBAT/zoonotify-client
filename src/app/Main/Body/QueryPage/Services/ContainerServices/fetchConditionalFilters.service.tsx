import _ from "lodash";
import { FilterInterface } from "../../../../../Shared/Model/Filter.model";
import {
    ApiResponse,
    callApiService,
} from "../../../../../Core/callApi.service";
import { FilterConfigDTO } from "../../../../../Shared/Model/Api_Filter.model";
import { FILTER_URL } from "../../../../../Shared/URLs";
import { generateUniqueValuesService } from "../generateUniqueValues.service";
import {
    allSubFiltersList,
    mainFilterList,
} from "../../../../../Shared/Model/Client_Isolate.model";

export async function fetchConditionalFilters(props: {
    parameterURL: string;
    uniqueValues: FilterInterface;
    colAttribute: string;
    rowAttribute: string;
    displayedFilters: string[];
}): Promise<{ status: number; data: FilterInterface }> {
    const newUniqueValues = _.cloneDeep(props.uniqueValues);
    const filterStatusList: number[] = [];
    const newFilterFor: string[] = [...props.displayedFilters];
    if (props.rowAttribute !== "") {
        newFilterFor.push(props.rowAttribute);
    }
    if (props.colAttribute !== "") {
        newFilterFor.push(props.colAttribute);
    }

    const getConditionalFilterValues = newFilterFor.map(
        async (displayedFilter) => {
            const urlParams = new URLSearchParams(props.parameterURL);
            urlParams.delete("row");
            urlParams.delete("column");
            urlParams.delete(displayedFilter);

            const selectedFilterString = urlParams.toString();

            const conditionalFilterUrl = `${FILTER_URL}/${displayedFilter}?${selectedFilterString}`;

            const filterResponse: ApiResponse<FilterConfigDTO> =
                await callApiService(conditionalFilterUrl);

            filterStatusList.push(filterResponse.status);

            if (filterResponse.data) {
                const filterProp: FilterConfigDTO = filterResponse.data;

                const uniqueValuesObject: FilterInterface =
                    generateUniqueValuesService(
                        filterProp,
                        mainFilterList,
                        allSubFiltersList
                    );
                newUniqueValues.filters[displayedFilter] =
                    uniqueValuesObject.filters[displayedFilter];
            }
        }
    );

    await Promise.all(getConditionalFilterValues);

    let finalFilterStatus = 200;
    filterStatusList.forEach((status) => {
        if (status !== 200) {
            finalFilterStatus = status;
        }
    });

    return { status: finalFilterStatus, data: newUniqueValues };
}
