import { useTranslation } from "react-i18next";
import { DefaultPrevalenceDataContext } from "./PrevalenceDataContext";
import { useContext, useEffect } from "react";

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
interface PrevalenceSideContentReturn {
    selectAllMicroorganisms: (isSelected: boolean) => void;
    selectAllAnimalSpecies: (isSelected: boolean) => void;
    handleMicroorganismSelectionChange: (value: string[]) => void;
    handleAnimalSpeciesSelectionChange: (value: string[]) => void;
    selectedMicroorganisms: string[];
    selectedAnimalSpecies: string[];
    microorganismOptions: string[];
    animalSpeciesOptions: string[];
}
export const usePrevalenceSideContent = (): PrevalenceSideContentReturn => {
    const context = useContext(DefaultPrevalenceDataContext);
    if (!context) {
        throw new Error(
            "usePrevalenceSideContent must be used within a PrevalenceDataProvider",
        );
    }
    const { t } = useTranslation(["PrevalencePage"]);

    const selectAllMicroorganisms = (isSelected: boolean): void => {
        context.setSelectedMicroorganisms(
            isSelected ? microorganismOptions : [],
        );
    };

    const selectAllAnimalSpecies = (isSelected: boolean): void => {
        context.setSelectedAnimalSpecies(
            isSelected ? animalSpeciesOptions : [],
        );
    };

    const handleMicroorganismSelectionChange = (value: string[]): void => {
        context.setSelectedMicroorganisms(value);
    };

    const handleAnimalSpeciesSelectionChange = (value: string[]): void => {
        context.setSelectedAnimalSpecies(value);
    };

    useEffect(() => {
        context.setSelectedMicroorganisms(microorganismOptions);
        context.setSelectedAnimalSpecies(animalSpeciesOptions);
    }, []); // Assuming context and options are stable, otherwise, include them in the dependency array

    return {
        selectAllMicroorganisms,
        selectAllAnimalSpecies,
        handleMicroorganismSelectionChange,
        handleAnimalSpeciesSelectionChange,
        selectedMicroorganisms: context.selectedMicroorganisms,
        selectedAnimalSpecies: context.selectedAnimalSpecies,
        microorganismOptions: microorganismOptions.map((option) => t(option)),
        animalSpeciesOptions: animalSpeciesOptions.map((option) => t(option)),
    };
};
