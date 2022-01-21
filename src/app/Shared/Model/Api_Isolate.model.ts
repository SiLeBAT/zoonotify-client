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
        characteristics: {
            sepecies: string;
            serovar: string;
            serotype: string;
            spa_typ: string;
            o_group: string;
            h_group: string;
            stx1: string;
            stx2: string;
            eae: string;
            e_hly: string;
            ampc_carba_phenotype: string;
        };
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
