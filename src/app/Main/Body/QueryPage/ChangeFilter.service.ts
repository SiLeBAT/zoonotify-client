export function changeFilter(
    selectedOption: { value: string; label: string }[]
): string[] {
    if (selectedOption !== undefined) {
        const selectedFilter: string[] = [];
        selectedOption.forEach((element: { value: string; label: string }) => {
            selectedFilter.push(element.value);
        });
        return selectedFilter;
    }
    return [];
}
