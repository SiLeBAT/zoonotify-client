import { FilterInterface, FilterType } from "../Shared/Model/Filter.model";
import { defaultFilter } from "../Shared/Context/FilterContext";

function getFilterList(filterParameter: string | null): string[] {
    const filterList: string[] =
        filterParameter !== null &&
        filterParameter !== "" &&
        filterParameter !== "alle Werte"
            ? filterParameter.split("_")
            : [];
    return filterList;
}

export function getFilterFromPath(
    path: string,
    filterKeys: FilterType[]
): FilterInterface {
    const searchParams = new URLSearchParams(path);
    const filterFromPath: FilterInterface = { ...defaultFilter };

    filterKeys.forEach((filterElement) => {
        const paramsOfKey: string[] = getFilterList(
            searchParams.get(filterElement)
        );
        filterFromPath[filterElement] = paramsOfKey;
    });

    return filterFromPath;
}
