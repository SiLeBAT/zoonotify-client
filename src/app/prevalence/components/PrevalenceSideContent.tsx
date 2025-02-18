import React, { useState, useEffect } from "react";
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
    Grow,
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
import Markdown from "markdown-to-jsx";

interface ContentAttributes {
    content: string;
    title: string;
}

export function PrevalenceSideContent(): JSX.Element {
    const { t, i18n } = useTranslation(["PrevalencePage"]); // Include i18n
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
        setShowError,
        fetchOptions,
        setIsSearchTriggered,
    } = usePrevalenceFilters();

    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [infoDialogTitle, setInfoDialogTitle] = useState("");
    const [infoDialogContent, setInfoDialogContent] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<string[]>([]);

    useEffect((): void => {
        // Set initial filter order based on some logic
        setSelectedOrder([]);
    }, []);

    // UseEffect to listen for language changes and update options
    useEffect(() => {
        const handleLanguageChange = (): void => {
            fetchOptions();
        };
        i18n.on("languageChanged", handleLanguageChange);

        return () => {
            i18n.off("languageChanged", handleLanguageChange);
        };
    }, [i18n, fetchOptions]);

    const handleInfoClick = async (categoryKey: string): Promise<void> => {
        const translatedCategory = t(categoryKey);
        try {
            const url = `${INFORMATION}?filters[title][$eq]=${encodeURIComponent(
                translatedCategory
            )}&locale=${i18next.language}&pagination[pageSize]=1`;
            const response = await callApiService<
                CMSResponse<Array<CMSEntity<ContentAttributes>>, unknown>
            >(url);
            if (response.data && response.data.data.length > 0) {
                const attributes = response.data.data[0].attributes;
                setInfoDialogTitle(attributes.title);
                setInfoDialogContent(attributes.content);
                setInfoDialogOpen(true);
            }
        } catch (error) {
            console.error("Failed to fetch information:", error);
        }
    };

    const handleClose = (): void => {
        setInfoDialogOpen(false);
    };

    const updateFilterOrder = (filter: string): void => {
        setSelectedOrder((prevOrder) => {
            if (!prevOrder.includes(filter)) {
                return [...prevOrder, filter];
            }
            return prevOrder;
        });
    };

    const handleSearch = async (): Promise<void> => {
        setShowError(false); // Reset the error visibility before starting the search
        await fetchDataFromAPI(); // Await the API fetch operation
        setShowError(true); // Set error visibility after the search completes
    };

    const filterComponents: { [key: string]: JSX.Element } = {
        year: (
            <Box
                key="year"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                }}
            >
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
                        handleChange: (event: any): void => {
                            const valueAsNumbers = event.target.value.map(
                                (val: string) => parseInt(val, 10)
                            );
                            setSelectedYear(valueAsNumbers);
                            updateFilterOrder("year");
                        },
                    }}
                />
                <Tooltip title={t("More Info on Sampling Year")}>
                    <IconButton
                        onClick={() => handleInfoClick("SAMPLING_YEAR")}
                        sx={{ marginLeft: 0.2 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        microorganism: (
            <Box
                key="microorganism"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <FilterMultiSelectionComponent
                    selectedItems={selectedMicroorganisms}
                    selectionOptions={microorganismOptions.map((option) => ({
                        value: option.name,
                        displayName: option.name,
                    }))}
                    name="microorganisms"
                    label={t("MICROORGANISM")}
                    actions={{
                        handleChange: (event): void => {
                            setSelectedMicroorganisms(
                                event.target.value as string[]
                            );
                            updateFilterOrder("microorganism");
                        },
                    }}
                />
                <Tooltip title={t("More Info on Microorganisms")}>
                    <IconButton
                        onClick={() => handleInfoClick("MICROORGANISM")}
                        sx={{ marginLeft: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        superCategory: (
            <Box
                key="superCategory"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <FilterMultiSelectionComponent
                    selectedItems={selectedSuperCategory}
                    selectionOptions={superCategorySampleOriginOptions.map(
                        (option) => ({
                            value: option.name,
                            displayName: option.name,
                        })
                    )}
                    name="superCategories"
                    label={t("SUPER-CATEGORY-SAMPLE-ORIGIN")}
                    actions={{
                        handleChange: (event): void => {
                            setSelectedSuperCategory(
                                event.target.value as string[]
                            );
                            updateFilterOrder("superCategory");
                        },
                    }}
                />
                <Tooltip title={t("More Info on Super Categories")}>
                    <IconButton
                        onClick={() =>
                            handleInfoClick("SUPER-CATEGORY-SAMPLE-ORIGIN")
                        }
                        sx={{ marginLeft: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        sampleOrigin: (
            <Box
                key="sampleOrigin"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <FilterMultiSelectionComponent
                    selectedItems={selectedSampleOrigins}
                    selectionOptions={sampleOriginOptions.map((option) => ({
                        value: option.name,
                        displayName: option.name,
                    }))}
                    name="sampleOrigins"
                    label={t("SAMPLE_ORIGIN")}
                    actions={{
                        handleChange: (event): void => {
                            setSelectedSampleOrigins(
                                event.target.value as string[]
                            );
                            updateFilterOrder("sampleOrigin");
                        },
                    }}
                />
                <Tooltip title={t("More Info on Sample Origins")}>
                    <IconButton
                        onClick={() => handleInfoClick("SAMPLE_ORIGIN")}
                        sx={{ marginLeft: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        samplingStage: (
            <Box
                key="samplingStage"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <FilterMultiSelectionComponent
                    selectedItems={selectedSamplingStages}
                    selectionOptions={samplingStageOptions.map((option) => ({
                        value: option.name,
                        displayName: option.name,
                    }))}
                    name="samplingStages"
                    label={t("SAMPLING_STAGE")}
                    actions={{
                        handleChange: (event): void => {
                            setSelectedSamplingStages(
                                event.target.value as string[]
                            );
                            updateFilterOrder("samplingStage");
                        },
                    }}
                />
                <Tooltip title={t("More Info on Sampling Stages")}>
                    <IconButton
                        onClick={() => handleInfoClick("SAMPLING_STAGE")}
                        sx={{ marginLeft: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        matrixGroup: (
            <Box
                key="matrixGroup"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <FilterMultiSelectionComponent
                    selectedItems={selectedMatrixGroups}
                    selectionOptions={matrixGroupOptions.map((option) => ({
                        value: option.name,
                        displayName: option.name,
                    }))}
                    name="matrixGroups"
                    label={t("MATRIX_GROUP")}
                    actions={{
                        handleChange: (event): void => {
                            setSelectedMatrixGroups(
                                event.target.value as string[]
                            );
                            updateFilterOrder("matrixGroup");
                        },
                    }}
                />
                <Tooltip title={t("More Info on Matrix Groups")}>
                    <IconButton
                        onClick={() => handleInfoClick("MATRIX_GROUP")}
                        sx={{ marginLeft: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        matrix: (
            <Box
                key="matrix"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <FilterMultiSelectionComponent
                    selectedItems={selectedMatrices}
                    selectionOptions={matrixOptions.map((option) => ({
                        value: option.name,
                        displayName: option.name,
                    }))}
                    name="matrices"
                    label={t("MATRIX")}
                    actions={{
                        handleChange: (event): void => {
                            setSelectedMatrices(event.target.value as string[]);
                            updateFilterOrder("matrix");
                        },
                    }}
                />
                <Tooltip title={t("More Info on Matrices")}>
                    <IconButton
                        onClick={() => handleInfoClick("MATRIX")}
                        sx={{ marginLeft: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
    };

    const getTransitionIn = (): boolean => {
        return true;
    };

    const orderedComponents = selectedOrder.map((key: string) => (
        <Grow in={getTransitionIn()} timeout={500} key={key}>
            {filterComponents[key]}
        </Grow>
    ));

    const remainingComponents = Object.keys(filterComponents)
        .filter((key: string) => !selectedOrder.includes(key))
        .map((key: string) => (
            <Grow in={getTransitionIn()} timeout={500} key={key}>
                {filterComponents[key]}
            </Grow>
        ));

    const resetFilters = async (): Promise<void> => {
        // Resetting the local states
        setSelectedMicroorganisms([]);
        setSelectedSampleOrigins([]);
        setSelectedMatrices([]);
        setSelectedSamplingStages([]);
        setSelectedMatrixGroups([]);
        setSelectedYear([]);
        setSelectedSuperCategory([]);
        setSelectedOrder([]); // Reset the order of the filters
        setIsSearchTriggered(false);
        setShowError(false);

        await fetchOptions(); // Re-fetch data to reset all options, including years

        // Reset the URL to remove query parameters
        window.history.replaceState(null, "", window.location.pathname);

        // Optionally, reload the page to ensure everything is in its initial state
        // window.location.reload();
    };

    return (
        <Box
            sx={{
                padding: "10px", // Add padding inside the sidebar
                height: "80vh",
                overflowY: "auto",
                width: "410px",
                maxHeight: "calc(140vh)",
                maxWidth: "95%",
            }}
        >
            <Stack spacing={0.5} alignItems="flex-start">
                {orderedComponents}
                {remainingComponents}
            </Stack>
            <Dialog open={infoDialogOpen} onClose={handleClose}>
                <DialogTitle>{infoDialogTitle}</DialogTitle>
                <DialogContent>
                    {/* Render Markdown content */}
                    <DialogContentText>
                        <Markdown>{infoDialogContent}</Markdown>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 2,
                    gap: "16px",
                }}
            >
                <Button
                    variant="contained"
                    startIcon={<Search />}
                    onClick={handleSearch}
                >
                    {t("SEARCH")}
                </Button>
                <Button variant="contained" onClick={resetFilters}>
                    {t("RESET_FILTERS")}
                </Button>
            </Box>
        </Box>
    );
}
