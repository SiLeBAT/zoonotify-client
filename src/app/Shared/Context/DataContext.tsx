import React, { useState, createContext } from "react";
import { DBentry, DBtype } from "../Isolat.model";

interface DataInterface {
    ZNData: DBentry[];
    keyValues: DBtype[];
    uniqueValues: {
        Erreger: string[],
    };
}

const defaultProfile: DataInterface = {
    ZNData: [],
    keyValues: [],
    uniqueValues: {
        Erreger: [],
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
