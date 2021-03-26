import { adaptIsolatesFromAPI } from "../../../Core/adaptIsolatesFromAPI.service";
import { FilterConfigDTO } from "../../../Shared/Model/Api_Filter.model";
import { IsolateDTO } from "../../../Shared/Model/Api_Isolate.model";
import { DbCollection } from "../../../Shared/Model/Client_Isolate.model";
import { FilterInterface } from "../../../Shared/Model/Filter.model";
import { generateUniqueValuesService } from "./generateUniqueValues.service";

export async function dataApiService(
    ISOLATE_URL: string,
    FILTER_URL: string
): Promise<{
    isolateStatus: number;
    filterStatus: number;
    adaptedDbIsolates?: DbCollection;
    uniqueValuesObject?: FilterInterface;
}> {
    const isolateResponse: Response = await fetch(ISOLATE_URL);
    const filterResponse: Response = await fetch(FILTER_URL);

    const isolateStatus = isolateResponse.status;
    const filterStatus = filterResponse.status;

    if (isolateStatus === 200 && filterStatus === 200) {
        const isolateProp: IsolateDTO = await isolateResponse.json();
        const filterProp: FilterConfigDTO = await filterResponse.json();

        const adaptedDbIsolates: DbCollection = adaptIsolatesFromAPI(
            isolateProp
        );
        const uniqueValuesObject: FilterInterface = generateUniqueValuesService(
            filterProp
        );
        return {
            isolateStatus,
            filterStatus,
            adaptedDbIsolates,
            uniqueValuesObject,
        };
    }
    return { isolateStatus, filterStatus};
}
