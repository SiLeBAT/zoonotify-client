import _ from "lodash";
import { FilterType } from "../Shared/Filter.model";

export function gernerateSettings(
    tableValue: FilterType
): [boolean, FilterType[]] {
    const noValues: boolean = _.isEmpty(tableValue);
    let selectedValuesList: FilterType[] = [tableValue];
    if (noValues) {
        selectedValuesList = [];
    }
    return [noValues, selectedValuesList];
}
