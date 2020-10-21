export const mainFilterAttributes = [
    "Erreger",
    "Matrix",
    "Projektname",
] as const;

export type FilterType = typeof mainFilterAttributes[number];

export type FilterInterface = Record<FilterType, string[]>;
