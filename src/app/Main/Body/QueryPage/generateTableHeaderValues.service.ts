import _ from "lodash";
import {
    FilterInterface,
} from "../../../Shared/Model/Filter.model";

export function generateTableHeaderValuesService(
    isSelected: boolean,
    allValuesTitle: string,
    uniqueValues: FilterInterface,
    selectedFilters: FilterInterface,
    headerAttribute: string,
): string[] {
    let tableHeaderValues: string[] = [allValuesTitle];
    if (isSelected) {
        const isEmptyFilter = _.isEmpty(selectedFilters[headerAttribute]);
        tableHeaderValues = isEmptyFilter
            ? uniqueValues[headerAttribute]
            : selectedFilters[headerAttribute];
    }

    return tableHeaderValues;
}
