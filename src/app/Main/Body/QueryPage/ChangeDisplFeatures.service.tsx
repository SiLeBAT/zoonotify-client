import { ValueType } from "react-select";
import { FilterType } from "../../../Shared/Model/Filter.model";

export function handleChangeDisplayedFeatures(
    selectedOption: ValueType<{value: string, label: string}>
): FilterType {
    if (selectedOption) {
        const selectedFeature: string = (Object.values(selectedOption)[0]);
        return selectedFeature as FilterType;
    }
    return "";
}
