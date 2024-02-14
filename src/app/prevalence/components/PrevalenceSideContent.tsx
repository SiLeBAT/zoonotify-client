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
import { useSelection } from "./SelectionContext";
import { useTranslation } from "react-i18next";

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

const microorganismOptions = [
    "BAYLISASCARIS PROCYONIS",
    "CLOSTRIDIOIDES DIFFICILE",
    "DUNKER SCHER MUSKELEGEL",
    "HEPATITIS A VIRUS",
    "HEPATITIS E VIRUS",
    "NOROVIRUS",
    "PRÄSUMTIVER BACILLUS CEREUS",
    "VIBRIO SPP",
    "YERSINIA ENTEROCOLITICA",
    "CAMPYLOBACTER_SPP",
    "ESBL_AMPC_E_COLI",
    "LISTERIS_MONOCYTOGENES",
    "MRSA",
    "SALMONELLA_SPP",
    "STEC",
    "CARBA_E_COLI",
    "ENTEROCOCCUS_SPP",
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

export function PrevalenceSideContent(): JSX.Element {
    // This already has a return type specified.
    const {
        selectedMicroorganisms,
        setSelectedMicroorganisms,
        selectedAnimalSpecies,
        setSelectedAnimalSpecies,
    } = useSelection();
    const { t } = useTranslation(["PrevalencePage"]);

    const selectAllMicroorganisms = (isSelected: boolean): void => {
        setSelectedMicroorganisms(isSelected ? microorganismOptions : []);
    };

    const selectAllAnimalSpecies = (isSelected: boolean): void => {
        setSelectedAnimalSpecies(isSelected ? animalSpeciesOptions : []);
    };

    const handleMicroorganismChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        option: string
    ): void => {
        setSelectedMicroorganisms(
            event.target.checked
                ? [...selectedMicroorganisms, option]
                : selectedMicroorganisms.filter(
                      (microorganism) => microorganism !== option
                  )
        );
    };

    const handleAnimalSpeciesChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        option: string
    ): void => {
        setSelectedAnimalSpecies(
            event.target.checked
                ? [...selectedAnimalSpecies, option]
                : selectedAnimalSpecies.filter((species) => species !== option)
        );
    };

    const applySelections = (): void => {
        // The state is already updated onChange, so you might want to execute some action here.
    };

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
                                {" "}
                                {t("SELECT_ALL")}{" "}
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
                                            onChange={(e) =>
                                                handleMicroorganismChange(
                                                    e,
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
                    <Typography>Animal Species</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">
                            <Button
                                onClick={() => selectAllAnimalSpecies(true)}
                            >
                                {" "}
                                {t("SELECT_ALL")}{" "}
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
                                            onChange={(e) =>
                                                handleAnimalSpeciesChange(
                                                    e,
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
                <Button
                    variant="contained"
                    onClick={applySelections}
                    startIcon={<FilterListIcon />}
                >
                    {t("FILTER")}
                </Button>
            </Box>
        </Box>
    );
}
