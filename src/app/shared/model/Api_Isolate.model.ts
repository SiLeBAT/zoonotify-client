import { Resistances } from "./Client_Isolate.model";

export interface IsolateDTO {
    isolates: {
        microorganism: string;
        samplingYear: Date;
        federalState: string;
        samplingContext: string;
        samplingStage: string;
        origin: string;
        category: string;
        productionType: string;
        matrix: string;
        matrixDetail: string;
        characteristics: Record<string, string>;
        resistance: Record<
            Resistances,
            {
                value: string;
                active: boolean;
            }
        >;
    }[];
}

export interface IsolateCountedDTO {
    totalNumberOfIsolates: number;
    groups?: (Record<string, string | Date> & {
        count: number;
    })[];
}
