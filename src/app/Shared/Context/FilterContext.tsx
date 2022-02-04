import React, { useState, createContext } from "react";
import { DbKey } from "../Model/Client_Isolate.model";
import { FilterInterface, FilterType } from "../Model/Filter.model";

export interface FilterContextInterface {
    mainFilters: string[];
    selectedFilter: FilterInterface;
}

export const defaultFiltersToDisplay = [
    "microorganism",
    "samplingYear",
    "samplingContext",
];

const convertArrayToObject = (
    array: (string | DbKey)[]
): Record<FilterType, string[]> => {
    const initialValue = {};
    return array.reduce((obj, item) => {
        return {
            ...obj,
            [item]: [],
        };
    }, initialValue);
};

const defaultSelectedFilters = convertArrayToObject(defaultFiltersToDisplay);

export const defaultFilter: FilterContextInterface = {
    mainFilters: [],
    selectedFilter: { filters: defaultSelectedFilters, subfilters: {} },
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
