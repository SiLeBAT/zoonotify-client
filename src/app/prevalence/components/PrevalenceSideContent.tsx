import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import Search from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { FilterMultiSelectionComponent } from "../../evaluations/components/FilterMultiSelectionComponent";
import { usePrevalenceSideContent } from "./usePrevalenceSideContent";

export function PrevalenceSideContent(): JSX.Element {
    const { t } = useTranslation(["PrevalencePage"]);
    const {
        handleMicroorganismSelectionChange,
        handleAnimalSpeciesSelectionChange,
        microorganismOptions,
        animalSpeciesOptions,
    } = usePrevalenceSideContent();

    // Local state for selections
    const [localSelectedMicroorganisms, setLocalSelectedMicroorganisms] =
        useState<string[]>([]);
    const [localSelectedAnimalSpecies, setLocalSelectedAnimalSpecies] =
        useState<string[]>([]);

    // Convert options to expected format for the FilterMultiSelectionComponent
    const microorganismSelectionOptions = microorganismOptions.map(
        (option) => ({
            value: option,
            displayName: option,
        })
    );
    const animalSpeciesSelectionOptions = animalSpeciesOptions.map(
        (option) => ({
            value: option,
            displayName: option,
        })
    );

    // Function to update local state when selections change
    const handleLocalMicroorganismsChange = (selected: string[]): void => {
        setLocalSelectedMicroorganisms(selected);
    };

    const handleLocalAnimalSpeciesChange = (selected: string[]): void => {
        setLocalSelectedAnimalSpecies(selected);
    };

    // Function to call when the search button is clicked
    const handleSearch = (): void => {
        handleMicroorganismSelectionChange(localSelectedMicroorganisms);
        handleAnimalSpeciesSelectionChange(localSelectedAnimalSpecies);
    };

    return (
        <Box
            sx={{
                padding: 0,
                height: "100vh",
                overflowY: "auto",
                width: "100%",
                maxWidth: "400px",
            }}
        >
            <FilterMultiSelectionComponent
                selectedItems={localSelectedMicroorganisms}
                selectionOptions={microorganismSelectionOptions}
                name="microorganisms"
                label={t("Microorganism")}
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) =>
                        handleLocalMicroorganismsChange(event.target.value),
                }}
            />

            <FilterMultiSelectionComponent
                selectedItems={localSelectedAnimalSpecies}
                selectionOptions={animalSpeciesSelectionOptions}
                name="animalSpecies"
                label={t("Animal Species")}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) =>
                        handleLocalAnimalSpeciesChange(event.target.value),
                }}
            />

            {/* Filter Button */}
            <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
                <Button
                    variant="contained"
                    startIcon={<Search />}
                    onClick={handleSearch}
                >
                    {t("SEARCH")}
                </Button>
            </Box>
        </Box>
    );
}
