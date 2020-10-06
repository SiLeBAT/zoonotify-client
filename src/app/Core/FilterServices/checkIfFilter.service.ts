import _ from "lodash";
import {
    FilterInterface,
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
