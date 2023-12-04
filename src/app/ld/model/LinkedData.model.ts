export interface SelectionItem {
    value: string;
    displayName: string;
}

export type FilterSelection = {
    matrix: string[];
    animalSpeciesProductionDirectionFood: string[];
    animalSpeciesFoodUpperCategory: string[];
    microorganism: string[];
};

export type SelectionFilterConfig = {
    label: string;
    id: string;
    selectedItems: string[];
    selectionOptions: SelectionItem[];
    handleChange: (event: { target: { value: string } }) => void;
};
