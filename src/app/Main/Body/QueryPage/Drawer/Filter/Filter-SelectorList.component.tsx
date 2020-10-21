import { ValueType } from "react-select";
import {
    FilterType,
} from "../../../../../Shared/Filter.model";
import { SelectorElement } from "./Filter-SelectorElement.component";
import { TableType } from "../../../../../Shared/Context/TableContext";

/**
 * @desc generate a selector-element for each main filter
 * @return {JSX.Element[]} selector-elements in a list
 */
export function AddSelectorElements(
    mainFilterAttributes: string[],
    handleChange: (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType | TableType
    ) => void
): JSX.Element[] {
    const totalNumberOfFilters: number = mainFilterAttributes.length;
    const elements: JSX.Element[] = [];
    for (let i = 0; i < totalNumberOfFilters; i += 1) {
        elements.push(
            SelectorElement({
                index: i,
                mainFilterAttributes,
                handleChange,
            })
        );
    }
    return elements;
}
