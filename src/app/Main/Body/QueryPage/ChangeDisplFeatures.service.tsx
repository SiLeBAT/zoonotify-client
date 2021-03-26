import { FilterType } from "../../../Shared/Model/Filter.model";

export function handleChangeDisplayedFeatures(
    selectedOption: {value: string, label: string}
): FilterType {
    if (selectedOption !== undefined && selectedOption.value !== undefined) {
        const selectedFeature: string = selectedOption.value;
        return selectedFeature as FilterType;
    }
    return "";
}
