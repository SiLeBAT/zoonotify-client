export interface FilterInterface {
    Erreger: string[];
    Matrix: string[];
    Projektname: string[];
}

export type FilterType = "Erreger" | "Matrix" | "Projektname";

export const mainFilterAttributes: FilterType[] = ["Erreger", "Matrix", "Projektname"];
