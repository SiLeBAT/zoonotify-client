export type FilterType = string;

export type FilterInterface = Record<FilterType, string[]>;

export interface FilterConfigDTO {
    filters: {
        id: string;
        name: string;
        parent: string;
        values: string[];
    }[];
}

export interface SingleFilterConfig {
    id: string;
    name: string;
    parent: string;
    values: string[];
}
