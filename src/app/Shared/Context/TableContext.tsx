import React, { useState, createContext } from "react";
import { FilterType } from "../Model/Filter.model";

export type TableType = "row" | "column";
export type OptionType = "absolute" | "percent"

export interface TableInterface {
    row: FilterType;
    column: FilterType;
    option: OptionType;
    statisticDataAbsolute: Record<string, string>[];
    statisticDataPercent: Record<string, string>[];
}

export const defaultTable: TableInterface = {
    row: "" as FilterType,
    column: "" as FilterType,
    option: "absolute",
    statisticDataAbsolute: [],
    statisticDataPercent: [],
};

interface ProfileState {
    table: TableInterface;
    setTable: React.Dispatch<React.SetStateAction<TableInterface>>;
}

const defaultTableState: ProfileState = {
    table: defaultTable,
    setTable: (): void => {},
};

export const TableContext = createContext<ProfileState>(defaultTableState);

export const TableProvider = (props: {
    children: React.ReactNode;
}): JSX.Element => {
    const [table, setTable] = useState(defaultTable);

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
