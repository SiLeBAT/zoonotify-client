export interface FilterConfigDTO {
    filters: {
        id: string;
        name: string;
        parent: string;
        values: string[] | Date[];
    }[];
}