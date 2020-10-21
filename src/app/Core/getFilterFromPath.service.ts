import { FilterInterface, FilterType } from "../Shared/Filter.model";
import { defaultFilter } from "../Shared/Context/FilterContext";

function getFilterList(filterParameter: string | null): string[] {
    let filterList: string[] = [];
    if (
        filterParameter !== null &&
        filterParameter !== "" &&
        filterParameter !== "alle Werte"
    ) {
        filterList = filterParameter.split("_");
    } else {
        filterList = [];
    }
    return filterList;
}

export function getFilterFromPath(
    path: string,
    filterKeys: readonly FilterType[]
): FilterInterface {
    const searchParams = new URLSearchParams(path);
    const filterFromPath: FilterInterface = { ...defaultFilter };

    filterKeys.forEach((filterElement) => {
        const paramsOfKey: string[] = getFilterList(searchParams.get(filterElement));
        filterFromPath[filterElement] = paramsOfKey;
    });

    return filterFromPath;
}
