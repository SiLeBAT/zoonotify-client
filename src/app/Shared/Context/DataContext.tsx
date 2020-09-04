import React, { useState, createContext } from "react";
import { DBentry, DBtype } from "../Isolat.model";

interface DataInterface {
    ZNData: DBentry[];
    ZNDataFiltered: DBentry[];
    keyValues: DBtype[];
    uniqueValues: {
        Erreger: string[],
        Matrix: string[],
        Projektname: string[]
    };
}

const defaultProfile: DataInterface = {
    ZNData: [],
    ZNDataFiltered: [],
    keyValues: [],
    uniqueValues: {
        Erreger: [],
        Matrix: [],
        Projektname: [],
    },
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
