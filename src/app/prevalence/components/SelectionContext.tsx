import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context data
interface SelectionContextData {
    selectedMicroorganisms: string[];
    setSelectedMicroorganisms: (microorganisms: string[]) => void;
    selectedAnimalSpecies: string[];
    setSelectedAnimalSpecies: (species: string[]) => void;
}

// Create the context with an initial undefined value
const SelectionContext = createContext<SelectionContextData | undefined>(
    undefined
);

// Create a custom hook to use the context
export const useSelection = (): SelectionContextData => {
    const context = useContext(SelectionContext);
    if (context === undefined) {
        throw new Error("useSelection must be used within a SelectionProvider");
    }
    return context;
};

// Create a provider component
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
