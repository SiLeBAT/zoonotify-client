export function chooseSelectedFiltersService(
    selectedOption: { value: string; label: string }[]
): string[] {
    if (selectedOption !== undefined) {
        const selectedFilter: string[] = [];
        selectedOption.forEach((element) => {
            selectedFilter.push(element.value);
        });
        return selectedFilter;
    }
    return [];
}
