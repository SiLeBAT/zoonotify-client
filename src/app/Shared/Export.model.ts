import { FilterType } from "./Filter.model";
import { DBentry, DBtype } from "./Isolat.model";

export interface ExportInterface {
    raw: boolean;
    stat: boolean;
    tableAttributes: {
        row: FilterType;
        column: FilterType;
    };
    rawDataSet: {
        rawData: DBentry[];
        rawKeys: DBtype[];
    };
    statDataSet: {
        statData: Record<string, string>[];
        statKeys: string[];
    };
}

export const defaultExport = {
    raw: true,
    stat: true,
    tableAttributes: {
        row: "" as FilterType,
        column: "" as FilterType,
    },
    rawDataSet: {
        rawData: [],
        rawKeys: [],
    },
    statDataSet: {
        statData: [],
        statKeys: [],
    },
};

export type MainFilterLabelInterface = Record<FilterType, string>
