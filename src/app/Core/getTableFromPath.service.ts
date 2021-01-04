import { FilterType } from "../Shared/Model/Filter.model";

export function getTableFromPath(path: string): FilterType[] {
    const searchParams = new URLSearchParams(path);
    const rowParam: FilterType = searchParams.get("row") as FilterType || "";
    const colParam: FilterType = searchParams.get("column") as FilterType || "";

    return [rowParam, colParam];
}
