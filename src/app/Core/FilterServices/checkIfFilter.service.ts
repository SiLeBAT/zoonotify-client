import _ from "lodash";
import {
    FilterInterface,
    FilterType,
    mainFilterAttributes,
} from "../../Shared/Filter.model";

export function CheckIfFilterIsSet(filter: FilterInterface): boolean {
    const noFilter = mainFilterAttributes.every(function emptyArray(
        key
    ): boolean {
        const empty: boolean = _.isEmpty(filter[key]);
        return empty;
    });

    return noFilter;
}

export function CheckIfSingleFilterIsSet(
    filter: FilterInterface,
    attribute: FilterType
): boolean {
    const noFilter = _.isEmpty(filter[attribute]);
    return noFilter;
}
