import { IsolateDTO } from "./Model/Api_Isolate.model";
import { DbCollection, ResistantValue } from "./Model/Client_Isolate.model";

/**
 * @desc Extracts the desired isolate properties from the api and converts them to a string if necessary.
 * @param isolateProp - isolates form api
 * @returns {DbCollection} - desired isolate properties as string
 */
export function adaptIsolatesFromAPI(isolateProp: IsolateDTO): DbCollection {
    const adaptedIsolates: DbCollection = isolateProp.isolates.map(
        ({
            microorganism,
            samplingContext,
            matrix,
            federalState,
            samplingStage,
            origin,
            category,
            productionType,
            resistance,
            samplingYear,
        }) => ({
            microorganism,
            samplingContext,
            matrix,
            federalState,
            samplingStage,
            origin,
            category,
            productionType,
            resistance: Object.keys(resistance) as ResistantValue[],
            samplingYear: String(samplingYear),
        })
    );

    return adaptedIsolates;
}
