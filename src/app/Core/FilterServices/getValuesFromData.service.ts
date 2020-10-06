import _ from "lodash";
import { FilterType, FilterInterface } from "../../Shared/Filter.model";

export function getValuesFromData(
    attribute: FilterType,
    uniqueValues: FilterInterface,
    filter: FilterInterface
): string[] {
    let values = uniqueValues[attribute];
    if (!_.isEmpty(filter[attribute])) {
        values = filter[attribute];
    }
    return values;
}
