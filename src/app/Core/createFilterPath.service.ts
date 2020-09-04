import _ from "lodash";
import {
    FilterType,
    FilterInterface,
} from "../Shared/Filter.model";

function setParams(key: string, value: string): string {
    const searchParams = new URLSearchParams();
    searchParams.set(key, value);
    return searchParams.toString();
}

export const createPathString = (filter: FilterInterface): string => {
    const filterKeyValues = Object.keys(filter) as FilterType[];
    let newPath = "";
    filterKeyValues.forEach((attribute: FilterType, index: number): void => {
        let filterString = "alle Werte";
        if (!_.isEmpty(filter[attribute])) {
            filterString = filter[attribute].join("_");
        }
        const x: string = setParams(attribute, filterString);
        if (index === filterKeyValues.length - 1) {
            newPath = newPath.concat(`${x}`);
        } else {
            newPath = newPath.concat(`${x}&`);
        }
    });
    return newPath;
};
