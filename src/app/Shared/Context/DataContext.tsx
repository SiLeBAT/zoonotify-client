import React, { useState, createContext } from "react";
import { DbCollection } from "../Model/Client_Isolate.model";
import { FilterInterface } from "../Model/Filter.model";

interface DataInterface {
    ZNData: DbCollection;
    uniqueValues: FilterInterface;
}

const defaultProfile: DataInterface = {
    ZNData: [],
    uniqueValues: {},
};

interface ProfileState {
    data: DataInterface;
    setData: React.Dispatch<React.SetStateAction<DataInterface>>;
}

const defaultProfileState: ProfileState = {
    data: defaultProfile,
    setData: (): void => {},
};

export const DataContext = createContext<ProfileState>(defaultProfileState);

export const DataProvider = (props: {
    children: React.ReactNode;
}): JSX.Element => {
    const [data, setData] = useState(defaultProfile);

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
