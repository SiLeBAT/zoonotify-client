export type FilterType = string;

export type FilterInterface = Record<FilterType, string[]>;

export interface FilterConfigApiInterface {
    filters: {
        id: string;
        name: string;
        parent: string;
        values: string[];
    }[];
}
