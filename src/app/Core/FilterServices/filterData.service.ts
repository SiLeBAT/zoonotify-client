import _ from "lodash";
import {
    FilterInterface,
    FilterType,
} from "../../Shared/Model/Filter.model";
import { DbCollection } from "../../Shared/Model/Isolate.model";

/**
 * @desc Filter the dataset with the selected filters
 * @param {DbCollection} - dataset
 * @param {FilterInterface} filter - object of selected filters
 * @returns {DbCollection} - filtered dataset
 */
export function filterData(
    data: DbCollection,
    filter: FilterInterface, 
    mainFilterAttributes: string[]
): DbCollection {
    let filteredData: DbCollection = data;
    mainFilterAttributes.map(async (attribute: FilterType) => {
        if (!_.isEmpty(filter[attribute])) {
            let tempFilteredData: DbCollection = [];
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
