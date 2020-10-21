import _ from "lodash";
import { FilterType, FilterInterface } from "../Shared/Filter.model";

function setParams(key: string, value: string): string {
    const searchParams = new URLSearchParams();
    searchParams.set(key, value);
    return searchParams.toString();
}

export const createPathString = (
    filter: FilterInterface,
    mainFilterAttributes: string[]
): string => {
    let newPath = "";
    mainFilterAttributes.forEach(
        (attribute: FilterType, index: number): void => {
            let filterString = "alle Werte";
            if (!_.isEmpty(filter[attribute])) {
                filterString = filter[attribute].join("_");
            }
            const paramsString: string = setParams(attribute, filterString);
            if (index === mainFilterAttributes.length - 1) {
                newPath = newPath.concat(`${paramsString}`);
            } else {
                newPath = newPath.concat(`${paramsString}&`);
            }
        }
    );

    return newPath;
};
