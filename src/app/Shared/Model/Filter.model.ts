export const mainFilterAttributes = [
    "Erreger",
    "Matrix",
    "Projektname",
];

export type FilterType = typeof mainFilterAttributes[number];

export type FilterInterface = Record<FilterType, string[]>;