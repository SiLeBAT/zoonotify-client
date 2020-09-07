import React, { useState, createContext } from "react";

export type TableType = "row" | "column"

export interface TableInterface {
    row: string
    column: string;
}

const defaultFilter: TableInterface = {
    row: "",
    column: ""
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