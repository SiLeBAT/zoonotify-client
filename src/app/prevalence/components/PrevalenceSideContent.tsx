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
        selectedSampleOrigins,
        setSelectedSampleOrigins,
        sampleOriginOptions,
        selectedMatrices,
        setSelectedMatrices,
        matrixOptions,
        selectedSamplingStages,
        setSelectedSamplingStages,
        samplingStageOptions,
        selectedMatrixGroups,
        setSelectedMatrixGroups,
        matrixGroupOptions,
        selectedYear,
        setSelectedYear,
        yearOptions,
        selectedSuperCategory,
        setSelectedSuperCategory,
        superCategorySampleOriginOptions,
        fetchDataFromAPI,
    } = usePrevalenceFilters();

    // Convert options to expected format for the FilterMultiSelectionComponent
    const microorganismSelectionOptions = microorganismOptions.map(
        (option) => ({
            value: option,
            displayName: option,
        })
    );
    const sampleOriginSelectionOptions = sampleOriginOptions.map((option) => ({
        value: option,
        displayName: option,
    }));
    const matrixSelectionOptions = matrixOptions.map((option) => ({
        value: option,
        displayName: option,
    }));
    const samplingStageSelectionOptions = samplingStageOptions.map(
        (option) => ({
            value: option,
            displayName: option,
        })
    );
    const matrixGroupSelectionOptions = matrixGroupOptions.map((option) => ({
        value: option,
        displayName: option,
    }));
    const yearSelectionOptions = yearOptions.map((year) => ({
        value: year.toString(),
        displayName: year.toString(),
    }));
    const superCategorySelectionOptions = superCategorySampleOriginOptions.map(
        (superCategory) => ({
            value: superCategory,
            displayName: superCategory,
        })
    );
    return (
        <Box
            sx={{
                padding: 0,
                height: "100vh",
                overflowY: "auto",
                width: "430px",
                maxWidth: "100%",
            }}
        >
            <FilterMultiSelectionComponent
                selectedItems={selectedYear.map(String)}
                selectionOptions={yearSelectionOptions}
                name="years"
                label={t("SAMPLING_YEAR")}
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) => {
                        const valueAsNumbers = event.target.value.map(
                            (val: string) => parseInt(val, 10)
                        );
                        setSelectedYear(valueAsNumbers);
                    },
                }}
            />

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
            <FilterMultiSelectionComponent
                selectedItems={selectedSuperCategory}
                selectionOptions={superCategorySelectionOptions}
                name="supercategories"
                label={t("SUPER-CATEGORY-SAMPLE-ORIGIN")}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) =>
                        setSelectedSuperCategory(event.target.value),
                }}
            />

            <FilterMultiSelectionComponent
                selectedItems={selectedSampleOrigins}
                selectionOptions={sampleOriginSelectionOptions}
                name="sampleOrigins"
                label={t("SAMPLE_ORIGIN")}
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) =>
                        setSelectedSampleOrigins(event.target.value),
                }}
            />

            <FilterMultiSelectionComponent
                selectedItems={selectedSamplingStages}
                selectionOptions={samplingStageSelectionOptions}
                name="samplingStages"
                label={t("SAMPLING_STAGE")}
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) =>
                        setSelectedSamplingStages(event.target.value),
                }}
            />

            <FilterMultiSelectionComponent
                selectedItems={selectedMatrixGroups}
                selectionOptions={matrixGroupSelectionOptions}
                name="matrixGroups"
                label={t("MATRIX_GROUP")}
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) =>
                        setSelectedMatrixGroups(event.target.value),
                }}
            />
            <FilterMultiSelectionComponent
                selectedItems={selectedMatrices}
                selectionOptions={matrixSelectionOptions}
                name="matrices"
                label={t("MATRIX")}
                actions={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleChange: (event: any) =>
                        setSelectedMatrices(event.target.value),
                }}
            />

            <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
                <Button
                    variant="contained"
                    startIcon={<Search />}
                    onClick={fetchDataFromAPI}
                >
                    {t("SEARCH")}
                </Button>
            </Box>
        </Box>
    );
}
