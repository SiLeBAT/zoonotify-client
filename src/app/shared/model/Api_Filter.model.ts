export interface FilterConfigDTO {
    filters: {
        id: string;
        name: string;
        parent: string;
        trigger: string;
        values: string[] | Date[];
    }[];
}
