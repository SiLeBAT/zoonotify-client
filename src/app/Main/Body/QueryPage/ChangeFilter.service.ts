import { ValueType } from "react-select";

export function changeFilter(
    selectedOption: ValueType<{value: string, label: string}>
): string[] {
    if (Array.isArray(selectedOption)) {
        const selectedFilter: string[] = [];
        selectedOption.forEach((element: {value: string, label: string}) => {
            selectedFilter.push(element.value);
        });
        return selectedFilter;
    }
    return [];
}
