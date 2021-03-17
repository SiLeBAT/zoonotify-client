export type FilterType = string;

export type FilterInterface = Record<FilterType, string[]>;
export interface ClientSingleFilterConfig {
    id: string;
    name: string;
    parent: string;
    values: string[];
}

export interface ClientFiltersConfig {
    filters: ClientSingleFilterConfig[];
  }
