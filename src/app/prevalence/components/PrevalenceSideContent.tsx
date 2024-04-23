import Search from "@mui/icons-material/Search";
import { Box, Button } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { FilterMultiSelectionComponent } from "../../evaluations/components/FilterMultiSelectionComponent";
import { usePrevalenceSideContent } from "./usePrevalenceSideContent";

export function PrevalenceSideContent(): JSX.Element {
    const { t } = useTranslation(["PrevalencePage"]);
    const {
        selectedMicroorganisms,
        selectedAnimalSpecies,
        handleMicroorganismSelectionChange,
        handleAnimalSpeciesSelectionChange,
        microorganismOptions,
        animalSpeciesOptions,
    } = usePrevalenceSideContent();

    const microorganismSelectionOptions = microorganismOptions.map(
        (option) => ({ value: option, displayName: option })
    );
    const animalSpeciesSelectionOptions = animalSpeciesOptions.map(
        (option) => ({ value: option, displayName: option })
    );

    const handleMicroorganismsChange = (selected: string[]): void => {
        handleMicroorganismSelectionChange(selected);
    };

    const handleAnimalSpeciesChange = (selected: string[]): void => {
        handleAnimalSpeciesSelectionChange(selected);
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
                selectedItems={selectedMicroorganisms}
                selectionOptions={microorganismSelectionOptions}
                name="microorganisms"
                label={t("Microorganism")}
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) =>
                        handleMicroorganismsChange(event.target.value),
                }}
            />

            <FilterMultiSelectionComponent
                selectedItems={selectedAnimalSpecies}
                selectionOptions={animalSpeciesSelectionOptions}
                name="animalSpecies"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={t("Animal Species")}
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) =>
                        handleAnimalSpeciesChange(event.target.value),
                }}
            />

            {/* Filter Button */}
            <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
                <Button variant="contained" startIcon={<Search />}>
                    {t("SEARCH")}
                </Button>
            </Box>
        </Box>
    );
}
