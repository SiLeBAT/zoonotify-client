import { IsolateDTO } from "../Shared/Model/Api_Isolate.model";
import { DbCollection } from "../Shared/Model/Client_Isolate.model";

export function adaptIsolatesFromAPI(
    isolateProp: IsolateDTO
): DbCollection {
    const adaptedIsolates: DbCollection = isolateProp.isolates.map(
        ({ microorganism, samplingContext, matrix }) => ({
            microorganism,
            samplingContext,
            matrix,
        })
    );

    return adaptedIsolates;
}
