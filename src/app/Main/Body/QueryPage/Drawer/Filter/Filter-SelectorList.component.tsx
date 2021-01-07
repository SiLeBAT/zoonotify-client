import { ValueType } from "react-select";
import { SelectorListSelectorComponent as Selector} from "./SelectorList-Selector.component";
import { TableType } from "../../../../../Shared/Context/TableContext";
import {
    FilterType,
    mainFilterAttributes,
} from "../../../../../Shared/Model/Filter.model";

/**
 * @desc Generate a selector-element for each main filter
 * @return {JSX.Element[]} selector-elements in a list
 */
export function FilterSelectorListComponent(
    handleChange: (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType | TableType
    ) => void
): JSX.Element[] {
    const totalNumberOfFilters: number = mainFilterAttributes.length;
    const elements: JSX.Element[] = [];
    for (let i = 0; i < totalNumberOfFilters; i += 1) {
        elements.push(
            Selector({
                index: i,
                handleChange,
            })
        );
    }
    return elements;
}
