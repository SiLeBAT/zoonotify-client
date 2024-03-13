import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { DefaultPrevalenceDataContext } from "./PrevalenceDataContext";

const microorganismOptions = [
    "Baylisascaris procyonis",
    "CARBA-E. coli",
    "Campylobacter spp.",
    "Clostridioides difficile",
    "Duncker'scher Muskelegel",
    "ESBL/AmpC-E. coli",
    "Echinococcus spp.",
    "Hepatitis-A-Virus",
    "Hepatitis-E-Virus",
    "Koagulase positiven Staphylokokken",
    "Kommensale E. coli",
    "Listeria monocytogenes",
    "MRSA",
    "Norovirus",
    "Präsumtive Bacillus cereus",
    "STEC",
    "Salmonella spp.",
    "Vibrio spp.",
    "Yersinia enterocolitica",
];

const animalSpeciesOptions = [
    "GEFLUEGEL",
    "HUHN",
    "KLEINEWIEDERKAEUER",
    "MEERESFRUECHTE",
    "NUTZTIERE",
    "PFLANZLICHELEBENSMITTEL",
    "PUTE",
    "REHWILD",
    "RIND",
    "SCHWEIN",
    "SCHWEINUNDRIND",
    "SUESSWASSERFISCHE",
    "WIEDERKAEUER",
    "WILDGEFLUEGEL",
    "WILDSCHWEIN",
    "WILDWIEDERKAEUER",
];

export const usePrevalenceSideContent = (): {
    selectAllMicroorganisms: (isSelected: boolean) => void;
    selectAllAnimalSpecies: (isSelected: boolean) => void;
    handleMicroorganismChange: (
        event: React.ChangeEvent<HTMLInputElement>,
        option: string
    ) => void;
    handleAnimalSpeciesChange: (
        event: React.ChangeEvent<HTMLInputElement>,
        option: string
    ) => void;
    selectedMicroorganisms: string[];
    selectedAnimalSpecies: string[];
    microorganismOptions: string[];
    animalSpeciesOptions: string[];
} => {
    const context = useContext(DefaultPrevalenceDataContext);
    if (!context) {
        throw new Error(
            "usePrevalenceSideContent must be used within a provider"
        );
    }
    const { t } = useTranslation(["PrevalencePage"]);

    const selectAllMicroorganisms = (isSelected: boolean): void => {
        context.setSelectedMicroorganisms(
            isSelected ? microorganismOptions.map((option) => t(option)) : []
        );
    };

    const selectAllAnimalSpecies = (isSelected: boolean): void => {
        context.setSelectedAnimalSpecies(
            isSelected ? animalSpeciesOptions.map((option) => t(option)) : []
        );
    };

    const handleMicroorganismChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        option: string
    ): void => {
        const translatedOption = t(option);
        if (event.target.checked) {
            context.setSelectedMicroorganisms([
                ...context.selectedMicroorganisms,
                translatedOption,
            ]);
        } else {
            context.setSelectedMicroorganisms(
                context.selectedMicroorganisms.filter(
                    (microorganism) => microorganism !== translatedOption
                )
            );
        }
    };

    const handleAnimalSpeciesChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        option: string
    ): void => {
        const translatedOption = t(option);
        if (event.target.checked) {
            context.setSelectedAnimalSpecies([
                ...context.selectedAnimalSpecies,
                translatedOption,
            ]);
        } else {
            context.setSelectedAnimalSpecies(
                context.selectedAnimalSpecies.filter(
                    (species) => species !== translatedOption
                )
            );
        }
    };

    return {
        selectAllMicroorganisms,
        selectAllAnimalSpecies,
        handleMicroorganismChange,
        handleAnimalSpeciesChange,
        selectedMicroorganisms: context.selectedMicroorganisms,
        selectedAnimalSpecies: context.selectedAnimalSpecies,
        microorganismOptions: microorganismOptions.map((option) => t(option)),
        animalSpeciesOptions: animalSpeciesOptions.map((option) => t(option)),
    };
};
