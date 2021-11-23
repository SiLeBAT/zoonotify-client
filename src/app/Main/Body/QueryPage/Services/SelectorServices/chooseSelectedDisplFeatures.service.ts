import { FilterType } from "../../../../../Shared/Model/Filter.model";

export function chooseSelectedDisplayedFeaturesService(
    selectedOption: { value: string; label: string } | null
): FilterType {
    if (selectedOption && selectedOption.value) {
        const selectedFeature = selectedOption.value;
        return selectedFeature;
    }
    return "";
}
