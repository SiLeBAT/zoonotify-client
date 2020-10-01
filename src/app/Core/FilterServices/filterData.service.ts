import _ from "lodash";
import {
    FilterInterface,
    FilterType,
    mainFilterAttributes,
} from "../../Shared/Filter.model";
import { DBentry } from "../../Shared/Isolat.model";

export function useFilter(data: DBentry[], filter: FilterInterface): DBentry[] {
    let filteredData: DBentry[] = data;
    mainFilterAttributes.map(async (attribute: FilterType) => {
        if (!_.isEmpty(filter[attribute])) {
            let tempFilteredData: DBentry[] = [];
            filter[attribute].forEach((element) => {
                tempFilteredData = tempFilteredData.concat(
                    _.filter(filteredData, {
                        [attribute]: element,
                    })
                );
            });
            filteredData = tempFilteredData;
        }
    });
    return filteredData;
}
