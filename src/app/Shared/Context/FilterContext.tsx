import React, { useState, createContext } from "react";
import { FilterInterface } from "../Filter.model";

export const defaultFilter: FilterInterface = {
    Erreger: [],
    Matrix: [],
    Projektname: []
};

interface ProfileState {
    filter: FilterInterface;
    setFilter: React.Dispatch<React.SetStateAction<FilterInterface>>;
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
