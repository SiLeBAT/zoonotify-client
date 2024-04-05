import React from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
    Box,
    Button,
    styled,
    FormControl,
    InputLabel,
    MenuItem,
    Checkbox,
    ListItemText,
    OutlinedInput,
    Accordion,
    AccordionDetails,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { usePrevalenceSideContent } from "./usePrevalenceSideContent";
import { useTranslation } from "react-i18next";
import { SelectAllComponent } from "../../shared/components/layout/SelectAllComponent";

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

    const onMicroorganismChange = (
        event: SelectChangeEvent<string[]>,
    ): void => {
        const { value } = event.target;
        if (value.includes("all")) {
            const newValue =
                selectedMicroorganisms.length === microorganismOptions.length
                    ? []
                    : microorganismOptions;
            handleMicroorganismSelectionChange(newValue);
        } else {
            handleMicroorganismSelectionChange(value as string[]);
        }
    };

    const onAnimalSpeciesChange = (
        event: SelectChangeEvent<string[]>,
    ): void => {
        const { value } = event.target;
        if (value.includes("all")) {
            const newValue =
                selectedAnimalSpecies.length === animalSpeciesOptions.length
                    ? []
                    : animalSpeciesOptions;
            handleAnimalSpeciesSelectionChange(newValue);
        } else {
            handleAnimalSpeciesSelectionChange(value as string[]);
        }
    };

    return (
        <Box
            sx={{
                padding: 0,
                height: "100vh",
                overflowY: "auto",
                Width: "20%",
                minWidth: "200px",
            }}
        >
            {/* Microorganisms Accordion */}
            <StyledAccordion>
                <AccordionDetails>
                    <FormControl fullWidth>
                        <InputLabel id="microorganism-select-label">
                            {t("Microorganism")}
                        </InputLabel>
                        <Select
                            labelId="microorganism-select-label"
                            multiple
                            value={selectedMicroorganisms}
                            onChange={onMicroorganismChange}
                            input={<OutlinedInput label={t("Microorganism")} />}
                            renderValue={(selected: string[]) =>
                                selected.join(", ")
                            }
                        >
                            <SelectAllComponent
                                allSelected={
                                    selectedMicroorganisms.length ===
                                    microorganismOptions.length
                                }
                                handleSelectAll={(isSelected: boolean) => {
                                    const newValue = isSelected
                                        ? microorganismOptions
                                        : [];
                                    handleMicroorganismSelectionChange(
                                        newValue,
                                    );
                                }}
                                optionsLength={microorganismOptions.length}
                            />
                            {microorganismOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    <Checkbox
                                        checked={selectedMicroorganisms.includes(
                                            option,
                                        )}
                                    />
                                    <ListItemText primary={option} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </AccordionDetails>
            </StyledAccordion>

            {/* Animal Species Accordion */}
            <StyledAccordion>
                <AccordionDetails>
                    <FormControl fullWidth>
                        <InputLabel id="animal-species-select-label">
                            {t("Animal Species")}
                        </InputLabel>
                        <Select
                            labelId="animal-species-select-label"
                            multiple
                            value={selectedAnimalSpecies}
                            onChange={onAnimalSpeciesChange}
                            input={
                                <OutlinedInput label={t("Animal Species")} />
                            }
                            renderValue={(selected: string[]) =>
                                selected.join(", ")
                            }
                        >
                            <SelectAllComponent
                                allSelected={
                                    selectedAnimalSpecies.length ===
                                    animalSpeciesOptions.length
                                }
                                handleSelectAll={(isSelected: boolean) => {
                                    const newValue = isSelected
                                        ? animalSpeciesOptions
                                        : [];
                                    handleAnimalSpeciesSelectionChange(
                                        newValue,
                                    );
                                }}
                                optionsLength={animalSpeciesOptions.length}
                            />
                            {animalSpeciesOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    <Checkbox
                                        checked={selectedAnimalSpecies.includes(
                                            option,
                                        )}
                                    />
                                    <ListItemText primary={option} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
