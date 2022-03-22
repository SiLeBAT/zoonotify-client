import _ from "lodash";

export function generateTableHeaderValuesService(
    isSelected: boolean,
    allValuesTitle: string,
    uniqueValues: Record<string, string[]>,
    selectedFilters: Record<string, string[]>,
    headerAttribute: string
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
