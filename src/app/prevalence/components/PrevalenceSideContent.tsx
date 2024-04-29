import Search from "@mui/icons-material/Search";
import { Box, Button } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { FilterMultiSelectionComponent } from "../../evaluations/components/FilterMultiSelectionComponent";
import { usePrevalenceFilters } from "./PrevalenceDataContext";

export function PrevalenceSideContent(): JSX.Element {
    const { t } = useTranslation(["PrevalencePage"]);
    const {
        selectedMicroorganisms,
        setSelectedMicroorganisms,
        microorganismOptions,
        callAPI,
    } = usePrevalenceFilters();

    // Convert options to expected format for the FilterMultiSelectionComponent
    const microorganismSelectionOptions = microorganismOptions.map(
        (option) => ({
            value: option,
            displayName: option,
        })
    );

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
                label={t("MICROORGANISMS")}
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) =>
                        setSelectedMicroorganisms(event.target.value),
                }}
            />

            <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
                <Button
                    variant="contained"
                    startIcon={<Search />}
                    onClick={callAPI}
                >
                    {t("SEARCH")}
                </Button>
            </Box>
        </Box>
    );
}
