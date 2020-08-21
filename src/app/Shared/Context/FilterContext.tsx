import React, { useState, createContext } from "react";

interface Filter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mainFilter: any;
    filterValue: string;
}

const defaultFilter: Filter = {
    mainFilter: {},
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
