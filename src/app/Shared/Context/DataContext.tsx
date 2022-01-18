import React, { useState, createContext } from "react";
import { FilterType } from "../Model/Filter.model";

export type FeatureType = "row" | "column";
export type DisplayOptionType = "absolute" | "relative";

export interface DataInterface {
    row: FilterType;
    column: FilterType;
    option: DisplayOptionType;
    statisticDataAbsolute: Record<string, string>[];
    statisticDataRelative: Record<string, string>[];
    statisticDataRelativeChart: Record<string, string>[];
    statTableDataWithSumsAbs: Record<string, string>[];
    statTableDataWithSumsRel: Record<string, string>[];
}

export const defaultData: DataInterface = {
    row: "" as FilterType,
    column: "" as FilterType,
    option: "absolute",
    statisticDataAbsolute: [],
    statisticDataRelative: [],
    statisticDataRelativeChart: [],
    statTableDataWithSumsAbs: [],
    statTableDataWithSumsRel: [],
};

interface ProfileState {
    data: DataInterface;
    setData: React.Dispatch<React.SetStateAction<DataInterface>>;
}

const defaultDataState: ProfileState = {
    data: defaultData,
    setData: (): void => {},
};

export const DataContext = createContext<ProfileState>(defaultDataState);

export const DataProvider = (props: {
    children: React.ReactNode;
}): JSX.Element => {
    const [data, setData] = useState(defaultData);

    return (
        <DataContext.Provider
            value={{
                data,
                setData,
            }}
        >
            {props.children}
        </DataContext.Provider>
    );
};
