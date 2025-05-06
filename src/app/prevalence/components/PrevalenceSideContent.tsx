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
import {
    INFORMATION,
    PEREVALENCE_INFO,
} from "../../shared/infrastructure/router/routes";
import Markdown from "markdown-to-jsx";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";

interface ContentAttributes {
    content: string;
    title: string;
}

export function PrevalenceSideContent(): JSX.Element {
    const { t, i18n } = useTranslation(["PrevalencePage"]);
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
    const [prevalenceInfo, setPrevalenceInfo] = useState<string>("");

    useEffect((): void => {
        setSelectedOrder([]);
    }, []);

    useEffect(() => {
        const handleLanguageChange = (): void => {
            fetchOptions();
        };
        i18n.on("languageChanged", handleLanguageChange);

        return () => {
            i18n.off("languageChanged", handleLanguageChange);
        };
    }, [i18n, fetchOptions]);

    // Fetch Prevalence Information
    useEffect(() => {
        const fetchPrevalenceInfo = async (): Promise<void> => {
            try {
                const url = `${PEREVALENCE_INFO}?locale=${i18next.language}&publicationState=live`;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = await callApiService<any>(url);

                // 1) grab your data object (flattened Strapi returns “.content” directly)
                const entity = response.data?.data;
                if (!entity) {
                    setPrevalenceInfo("No prevalence information available.");
                    return;
                }

                // 2) default to [] if it’s undefined
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const blocks: any[] =
                    entity.attributes?.content ?? entity.content ?? [];

                if (blocks.length === 0) {
                    setPrevalenceInfo("No content blocks found.");
                    return;
                }

                // 3) map → markdown
                const markdownContent = blocks
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((block: any) => {
                        // always a real array now
                        const children = block.children ?? [];

                        switch (block.type) {
                            case "paragraph": {
                                const text = children
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    .map((c: any) => c.text ?? "")
                                    .join("");
                                return text;
                            }

                            case "heading": {
                                const level = block.level ?? 1;
                                const text = children
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    .map((c: any) => c.text ?? "")
                                    .join("");
                                return `${"#".repeat(level)} ${text}`;
                            }

                            case "list": {
                                // for lists, each `item` has its own children
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const items: any[] = block.children ?? [];
                                return (
                                    items
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        .map((item: any, idx: number) => {
                                            const itemText = (
                                                item.children ?? []
                                            )
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                .map((c: any) => c.text ?? "")
                                                .join("");
                                            return block.format === "ordered"
                                                ? `${idx + 1}. ${itemText}`
                                                : `- ${itemText}`;
                                        })
                                        .join("\n")
                                );
                            }

                            case "link": {
                                const text = children
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    .map((c: any) => c.text ?? "")
                                    .join("");
                                return block.url && text
                                    ? `[${text}](${block.url})`
                                    : "";
                            }

                            default:
                                return "";
                        }
                    })
                    // strip out any empty strings & join
                    .filter((line: string) => line.trim().length > 0)
                    .join("\n\n");

                setPrevalenceInfo(markdownContent);
            } catch (error) {
                console.error("Failed to fetch prevalence info:", error);
                setPrevalenceInfo("Error loading prevalence information.");
            }
        };

        fetchPrevalenceInfo();
    }, [i18next.language]);

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
        setShowError(false);
        await fetchDataFromAPI();
        setShowError(true);
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
        setSelectedMicroorganisms([]);
        setSelectedSampleOrigins([]);
        setSelectedMatrices([]);
        setSelectedSamplingStages([]);
        setSelectedMatrixGroups([]);
        setSelectedYear([]);
        setSelectedSuperCategory([]);
        setSelectedOrder([]);
        setIsSearchTriggered(false);
        setShowError(false);
        await fetchOptions();
        window.history.replaceState(null, "", window.location.pathname);
    };

    return (
        <Box
            sx={{
                padding: "10px",
                height: "80vh",
                p: 2,
                overflowY: "auto",
                width: "470px",
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
            <Box sx={{ marginTop: 2 }}>
                <ZNAccordion
                    title={t("PREVALENCE_INFORMATION")}
                    content={
                        <Markdown
                            options={{
                                overrides: {
                                    a: {
                                        props: {
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                        },
                                    },
                                },
                            }}
                        >
                            {prevalenceInfo}
                        </Markdown>
                    }
                    defaultExpanded={false}
                    centerContent={false}
                />
            </Box>
        </Box>
    );
}
