export interface FilterInterface {
    Erreger: string[];
    Matrix: string[];
}

export type FilterType = "Erreger" | "Matrix";

export const mainFilterAttributes: FilterType[] = ["Erreger", "Matrix"];
