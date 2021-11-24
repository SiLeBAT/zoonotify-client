export interface FilterConfigDTO {
    filters: {
        id: string;
        name: string;
        parent: string;
        target: string;
        values: string[] | Date[];
    }[];
}