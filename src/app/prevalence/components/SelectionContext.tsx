import React, { createContext, useContext, useState, ReactNode } from "react";

interface SelectionContextData {
    selectedMicroorganisms: string[];
    setSelectedMicroorganisms: (microorganisms: string[]) => void;
    selectedAnimalSpecies: string[];
    setSelectedAnimalSpecies: (species: string[]) => void;
}

export const SelectionContext = createContext<SelectionContextData | undefined>(
    undefined
);
console.log("usePrevalenceFilters hook called", new Error().stack);

export const usePrevalenceFilters = (): SelectionContextData => {
    const context = useContext(SelectionContext);
    if (context === undefined) {
        throw new Error(
            "usePrevalenceFilters must be used within a SelectionProvider"
        );
    }
    return context;
};

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({
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
        <SelectionContext.Provider value={value}>
            {children}
        </SelectionContext.Provider>
    );
};
