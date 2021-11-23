export function chooseSelectedFiltersService(
    selectedOption: { value: string; label: string }[] | null
): string[] {
    if (selectedOption) {
        const selectedFilter: string[] = [];
        selectedOption.forEach((element) => {
            selectedFilter.push(element.value);
        });
        return selectedFilter;
    }
    return [];
}
