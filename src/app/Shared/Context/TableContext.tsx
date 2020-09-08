import React, { useState, createContext } from "react";
import { FilterType } from "../Filter.model";

export type TableType = "row" | "column";

export interface TableInterface {
    row: FilterType;
    column: FilterType;
}

const defaultFilter: TableInterface = {
    row: "" as FilterType,
    column: "" as FilterType,
};

interface ProfileState {
    table: TableInterface;
    setTable: React.Dispatch<React.SetStateAction<TableInterface>>;
}

const defaultFilterState: ProfileState = {
    table: defaultFilter,
    setTable: (): void => {},
};

export const TableContext = createContext<ProfileState>(defaultFilterState);

export const TableProvider = (props: {
    children: React.ReactNode;
}): JSX.Element => {
    const [table, setTable] = useState(defaultFilter);

    return (
        <TableContext.Provider
            value={{
                table,
                setTable,
            }}
        >
            {props.children}
        </TableContext.Provider>
    );
};