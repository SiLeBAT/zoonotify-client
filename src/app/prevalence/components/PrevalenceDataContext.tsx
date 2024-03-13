import React, { ReactNode, createContext, useContext, useState } from "react";

interface PrevalenceDataContext {
    selectedMicroorganisms: string[];
    setSelectedMicroorganisms: (microorganisms: string[]) => void;
    selectedAnimalSpecies: string[];
    setSelectedAnimalSpecies: (species: string[]) => void;
}

export const DefaultPrevalenceDataContext = createContext<
    PrevalenceDataContext | undefined
>(undefined);

export const usePrevalenceFilters = (): PrevalenceDataContext => {
    const context = useContext(DefaultPrevalenceDataContext);
    if (context === undefined) {
        throw new Error(
            "usePrevalenceFilters must be used within a PrevalenceDataProvider"
        );
    }
    return context;
};

export const PrevalenceDataProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [selectedMicroorganisms, setSelectedMicroorganisms] = useState<
        string[]
    >([]);
    const [selectedAnimalSpecies, setSelectedAnimalSpecies] = useState<
        string[]
    >([]);

    const value = {
        selectedMicroorganisms,
        setSelectedMicroorganisms,
        selectedAnimalSpecies,
        setSelectedAnimalSpecies,
    };

    return (
        <DefaultPrevalenceDataContext.Provider value={value}>
            {children}
        </DefaultPrevalenceDataContext.Provider>
    );
};
