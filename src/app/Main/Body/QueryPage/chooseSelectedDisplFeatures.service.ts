import { FilterType } from "../../../Shared/Model/Filter.model";

export function chooseSelectedDisplayedFeaturesService(
    selectedOption: {value: string, label: string}
): FilterType {
    if (selectedOption !== undefined && selectedOption.value !== undefined) {
        const selectedFeature = selectedOption.value;
        return selectedFeature;
    }
    return "";
}
