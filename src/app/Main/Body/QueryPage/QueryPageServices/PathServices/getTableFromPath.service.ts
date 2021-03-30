import { FilterType } from "../../../../../Shared/Model/Filter.model";

/**
 * @desc Extract the selected row and column from the given URL path
 * @param {string} path - URL path
 * @returns {FilterType[]} - list with the row and column from the URL path
 */
export function getFeaturesFromPath(path: string): FilterType[] {
    const searchParams = new URLSearchParams(path);
    const rowParam: FilterType = (searchParams.get("row") as FilterType) || "";
    const colParam: FilterType =
        (searchParams.get("column") as FilterType) || "";

    return [rowParam, colParam];
}
