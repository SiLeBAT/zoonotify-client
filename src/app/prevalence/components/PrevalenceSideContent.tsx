import React from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
    Box,
    Button,
    styled,
    Accordion,
    AccordionDetails,
} from "@mui/material";
import { usePrevalenceSideContent } from "./usePrevalenceSideContent";
import { useTranslation } from "react-i18next";
import { FilterMultiSelectionComponent } from "../../evaluations/components/FilterMultiSelectionComponent";

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    backgroundColor: "white",
    boxShadow: "none",
    "&:before": {
        display: "none",
    },
    "&.Mui-expanded": {
        margin: 0,
    },
}));

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
                minWidth: "300px",
            }}
        >
            <StyledAccordion>
                <AccordionDetails>
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
                </AccordionDetails>
            </StyledAccordion>

            <StyledAccordion>
                <AccordionDetails>
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
                </AccordionDetails>
            </StyledAccordion>

            {/* Filter Button */}
            <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
                <Button variant="contained" startIcon={<FilterListIcon />}>
                    {t("Filter")}
                </Button>
            </Box>
        </Box>
    );
}
