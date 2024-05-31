import React, { useState } from "react";
import {
    Box,
    Button,
    IconButton,
    Stack,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import Search from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { FilterMultiSelectionComponent } from "../../evaluations/components/FilterMultiSelectionComponent";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse, CMSEntity } from "../../shared/model/CMS.model";
import i18next from "i18next";
import { INFORMATION } from "../../shared/infrastructure/router/routes";

interface ContentAttributes {
    content: string;
    title: string;
}

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

    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [infoDialogTitle, setInfoDialogTitle] = useState("");
    const [infoDialogContent, setInfoDialogContent] = useState("");

    const handleInfoClick = async (category: string): Promise<void> => {
        console.log(`Fetching data for category: ${category}`);
        try {
            const url = `${INFORMATION}?filters[title][$eq]=${category}&locale=${i18next.language}&pagination[pageSize]=1`;
            const response = await callApiService<
                CMSResponse<Array<CMSEntity<ContentAttributes>>, unknown>
            >(url);
            if (response.data && response.data.data.length > 0) {
                const attributes = response.data.data[0].attributes;
                console.log(`Data fetched: ${attributes.content}`);
                setInfoDialogTitle(attributes.title);
                setInfoDialogContent(attributes.content);
                setInfoDialogOpen(true);
                console.log(`Dialog should now be open.`);
            } else {
                console.log("No data received.");
            }
        } catch (error) {
            console.error("Failed to fetch information:", error);
        }
    };
    const handleClose = (): void => {
        setInfoDialogOpen(false);
    };

    return (
        <Box
            sx={{
                padding: 0,
                height: "80vh",
                overflowY: "auto",
                width: "410px",
                maxHeight: "calc(140vh)",
                maxWidth: "95%",
            }}
        >
            <Stack spacing={0.1} alignItems="flex-start">
                <FilterMultiSelectionComponent
                    selectedItems={selectedYear.map(String)}
                    selectionOptions={yearOptions.map((option) => ({
                        value: option.toString(),
                        displayName: option.toString(),
                    }))}
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
                    extra={
                        <Tooltip title="More Info on Sampling Year">
                            <IconButton
                                onClick={() => handleInfoClick("Years")}
                            >
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    }
                />

                <FilterMultiSelectionComponent
                    selectedItems={selectedMicroorganisms}
                    selectionOptions={microorganismOptions.map((option) => ({
                        value: option,
                        displayName: option,
                    }))}
                    name="microorganisms"
                    label={t("MICROORGANISMS")}
                    actions={{
                        handleChange: (event) =>
                            setSelectedMicroorganisms(
                                event.target.value as string[]
                            ),
                    }}
                    extra={
                        <Tooltip title="More Info on Microorganisms">
                            <IconButton
                                onClick={() =>
                                    handleInfoClick("microorganisms")
                                }
                            >
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    }
                />
                <FilterMultiSelectionComponent
                    selectedItems={selectedSuperCategory}
                    selectionOptions={superCategorySampleOriginOptions.map(
                        (option) => ({
                            value: option,
                            displayName: option,
                        })
                    )}
                    name="superCategories"
                    label={t("SUPER-CATEGORY-SAMPLE-ORIGIN")}
                    actions={{
                        handleChange: (event) =>
                            setSelectedSuperCategory(
                                event.target.value as string[]
                            ),
                    }}
                    extra={
                        <Tooltip title="More Info on Super Categories">
                            <IconButton
                                onClick={() =>
                                    handleInfoClick("Super Categories")
                                }
                            >
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    }
                />

                <FilterMultiSelectionComponent
                    selectedItems={selectedSampleOrigins}
                    selectionOptions={sampleOriginOptions.map((option) => ({
                        value: option,
                        displayName: option,
                    }))}
                    name="sampleOrigins"
                    label={t("SAMPLE_ORIGIN")}
                    actions={{
                        handleChange: (event) =>
                            setSelectedSampleOrigins(
                                event.target.value as string[]
                            ),
                    }}
                    extra={
                        <Tooltip title="More Info on Sample Origins">
                            <IconButton
                                onClick={() =>
                                    handleInfoClick("Sample Origins")
                                }
                            >
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    }
                />

                <FilterMultiSelectionComponent
                    selectedItems={selectedSamplingStages}
                    selectionOptions={samplingStageOptions.map((option) => ({
                        value: option,
                        displayName: option,
                    }))}
                    name="samplingStages"
                    label={t("SAMPLING_STAGE")}
                    actions={{
                        handleChange: (event) =>
                            setSelectedSamplingStages(
                                event.target.value as string[]
                            ),
                    }}
                    extra={
                        <Tooltip title="More Info on Sampling Stages">
                            <IconButton
                                onClick={() =>
                                    handleInfoClick("Sampling Stages")
                                }
                            >
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    }
                />

                <FilterMultiSelectionComponent
                    selectedItems={selectedMatrixGroups}
                    selectionOptions={matrixGroupOptions.map((option) => ({
                        value: option,
                        displayName: option,
                    }))}
                    name="matrixGroups"
                    label={t("MATRIX_GROUP")}
                    actions={{
                        handleChange: (event) =>
                            setSelectedMatrixGroups(
                                event.target.value as string[]
                            ),
                    }}
                    extra={
                        <Tooltip title="More Info on Matrix Groups">
                            <IconButton
                                onClick={() => handleInfoClick("Matrix Groups")}
                            >
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    }
                />
                <FilterMultiSelectionComponent
                    selectedItems={selectedMatrices}
                    selectionOptions={matrixOptions.map((option) => ({
                        value: option,
                        displayName: option,
                    }))}
                    name="matrices"
                    label={t("MATRIX")}
                    actions={{
                        handleChange: (event) =>
                            setSelectedMatrices(event.target.value as string[]),
                    }}
                    extra={
                        <Tooltip title="More Info on Matrices">
                            <IconButton
                                onClick={() => handleInfoClick("Matrix")}
                            >
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    }
                />
            </Stack>
            <Dialog open={infoDialogOpen} onClose={handleClose}>
                <DialogTitle>{infoDialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{infoDialogContent}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>

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
