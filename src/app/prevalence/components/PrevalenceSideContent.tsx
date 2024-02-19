import React from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    styled,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslation } from "react-i18next";
import { usePrevalenceSideContent } from "./usePrevalenceSideContent";

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    backgroundColor: "white",
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    boxShadow: "none",
    "&:before": {
        display: "none",
    },
    "&.Mui-expanded": {
        margin: 0,
    },
}));

export function PrevalenceSideContent(): JSX.Element {
    const {
        selectedMicroorganisms,

        selectedAnimalSpecies,
        selectAllMicroorganisms,
        selectAllAnimalSpecies,
        handleMicroorganismChange,
        handleAnimalSpeciesChange,
        microorganismOptions,
        animalSpeciesOptions,
    } = usePrevalenceSideContent();

    const { t } = useTranslation(["PrevalencePage"]);

    return (
        <Box sx={{ padding: 2 }}>
            <StyledAccordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>{t("microorganism")}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">
                            <Button
                                onClick={() => selectAllMicroorganisms(true)}
                            >
                                {t("SELECT_ALL")}
                            </Button>
                            <Button
                                onClick={() => selectAllMicroorganisms(false)}
                            >
                                {t("DESELECT_ALL")}
                            </Button>
                        </FormLabel>
                        <FormGroup>
                            {microorganismOptions.map((option) => (
                                <FormControlLabel
                                    key={option}
                                    control={
                                        <Checkbox
                                            checked={selectedMicroorganisms.includes(
                                                option
                                            )}
                                            onChange={(event) =>
                                                handleMicroorganismChange(
                                                    event,
                                                    option
                                                )
                                            }
                                            name={option}
                                        />
                                    }
                                    label={option}
                                />
                            ))}
                        </FormGroup>
                    </FormControl>
                </AccordionDetails>
            </StyledAccordion>

            <StyledAccordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography>{t("animalSpecies")}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">
                            <Button
                                onClick={() => selectAllAnimalSpecies(true)}
                            >
                                {t("SELECT_ALL")}
                            </Button>
                            <Button
                                onClick={() => selectAllAnimalSpecies(false)}
                            >
                                {t("DESELECT_ALL")}
                            </Button>
                        </FormLabel>
                        <FormGroup>
                            {animalSpeciesOptions.map((option) => (
                                <FormControlLabel
                                    key={option}
                                    control={
                                        <Checkbox
                                            checked={selectedAnimalSpecies.includes(
                                                option
                                            )}
                                            onChange={(event) =>
                                                handleAnimalSpeciesChange(
                                                    event,
                                                    option
                                                )
                                            }
                                            name={option}
                                        />
                                    }
                                    label={option}
                                />
                            ))}
                        </FormGroup>
                    </FormControl>
                </AccordionDetails>
            </StyledAccordion>

            <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
                <Button variant="contained" startIcon={<FilterListIcon />}>
                    {t("FILTER")}
                </Button>
            </Box>
        </Box>
    );
}
