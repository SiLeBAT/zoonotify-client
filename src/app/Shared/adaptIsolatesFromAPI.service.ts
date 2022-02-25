import { IsolateDTO } from "./Model/Api_Isolate.model";
import { DbCollection, Resistances } from "./Model/Client_Isolate.model";

function adaptResistances(
    ApiResistances: Record<
        Resistances,
        {
            value: string;
            active: boolean;
        }
    >
): Record<Resistances, boolean> {
    const newResistance: Record<Resistances, boolean> = {} as Record<
        Resistances,
        boolean
    >;
    Object.keys(ApiResistances).forEach((resistanceKey) => {
        const key = resistanceKey as Resistances;
        newResistance[key] = ApiResistances[key].active;
    });
    return newResistance;
}

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
            characteristics,
            matrixDetail,
        }) => ({
            microorganism,
            samplingContext,
            matrix,
            federalState,
            samplingStage,
            origin,
            category,
            productionType,
            resistance: adaptResistances(resistance),
            samplingYear: String(samplingYear),
            characteristics,
            matrixDetail,
        })
    );

    return adaptedIsolates;
}
