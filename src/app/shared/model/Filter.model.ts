export type FilterType = string;

export type FilterInterface = {
    filters: Record<FilterType, string[]>;
    subfilters: Record<FilterType, string[]>;
};
export interface ClientSingleFilterConfig {
    id: string;
    name: string;
    parent?: string;
    trigger?: string;
    values: string[];
}

export interface ClientFiltersConfig {
    filters: ClientSingleFilterConfig[];
}
