import React, { useState, createContext } from "react";
import { FilterInterface } from "../Model/Filter.model";

export interface FilterContextInterface {
    mainFilter: string[];
    displayedFilters: string[]
    selectedFilter: FilterInterface;
}

export const defaultFiltersToDisplay = ["microorganism", "samplingYear", "samplingContext"]

export const defaultFilter: FilterContextInterface = {
    mainFilter: [],
    displayedFilters: defaultFiltersToDisplay,
    selectedFilter: {
        microorganism: [],
        samplingContext: [],
        matrix: [],
        federalState: [],
        samplingStage: [],
        origin: [],
        category: [],
        productionType: [],
        resistance: [],
        samplingYear: [],
    },
};
interface ProfileState {
    filter: FilterContextInterface;
    setFilter: React.Dispatch<React.SetStateAction<FilterContextInterface>>;
}

const defaultFilterState: ProfileState = {
    filter: defaultFilter,
    setFilter: (): void => {},
};

export const FilterContext = createContext<ProfileState>(defaultFilterState);

export const FilterProvider = (props: {
    children: React.ReactNode;
}): JSX.Element => {
    const [filter, setFilter] = useState(defaultFilter);

    return (
        <FilterContext.Provider
            value={{
                filter,
                setFilter,
            }}
        >
            {props.children}
        </FilterContext.Provider>
    );
};
