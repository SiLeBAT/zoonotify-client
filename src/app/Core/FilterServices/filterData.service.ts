import _ from "lodash";
import {
    FilterInterface,
    FilterType,
    mainFilterAttributes,
} from "../../Shared/Model/Filter.model";
import { DBentry } from "../../Shared/Model/Isolat.model";

/**
 * @desc Filter the dataset with the selected filters
 * @param {DBentry[]} - dataset 
 * @param {FilterInterface} filter - object of selected filters
 * @returns {DBentry[]} - filtered dataset
 */
export function filterData(data: DBentry[], filter: FilterInterface): DBentry[] {
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
