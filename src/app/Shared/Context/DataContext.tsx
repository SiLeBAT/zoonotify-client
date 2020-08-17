import React, { useState, createContext } from "react";
import { DBentry, DBtype } from "../Isolat.model";

interface DataInterface {
    data: DBentry[];
    keyValues: DBtype[];
    uniqueValues: string[];
}

const defaultProfile: DataInterface = {
    data: [],
    keyValues: [],
    uniqueValues: [],
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
