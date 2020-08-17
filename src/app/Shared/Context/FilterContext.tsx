import React, { useState, createContext } from "react";

interface Filter {
    filterValue: string;
}

const defaultFilter: Filter = {
    filterValue: "",
};

interface ProfileState {
    filter: Filter;
    setFilter: React.Dispatch<React.SetStateAction<Filter>>;
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
