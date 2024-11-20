import React, {
    ReactNode,
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import {
    MICROORGANISMS,
    SAMPLE_ORIGINS,
    MATRICES,
    SAMPLING_STAGES,
    MATRIX_GROUPS,
    SUPER_CATEGORY_SAMPLE_ORIGINS,
    PREVALENCES,
} from "../../shared/infrastructure/router/routes";
import {
    CMSEntity,
    CMSResponse,
    MAX_PAGE_SIZE,
} from "../../shared/model/CMS.model";

export type SearchParameters = Record<string, string[]>;

interface RelationalData {
    id: number;
    data: {
        attributes: {
            name: string;
        };
    };
}

interface PrevalenceAttributesDTO {
    samplingYear: number;
    numberOfSamples: number;
    numberOfPositive: number;
    percentageOfPositive: number;
    ciMin: number;
    ciMax: number;
    matrix: RelationalData;
    matrixDetail: RelationalData;
    matrixGroup: RelationalData;
    microorganism: RelationalData;
    samplingStage: RelationalData;
    sampleOrigin: RelationalData;
    superCategorySampleOrigin: RelationalData;
}

export type PrevalenceEntry = {
    id: number;
    samplingYear: number;
    numberOfSamples: number;
    numberOfPositive: number;
    percentageOfPositive: number;
    ciMin: number;
    ciMax: number;
    matrix: string;
    matrixGroup: string;
    samplingStage: string;
    sampleOrigin: string;
    microorganism: string;
    superCategorySampleOrigin: string;
};

interface Option {
    name: string;
}

interface PrevalenceDataContext {
    microorganismOptions: Option[];
    sampleOriginOptions: Option[];
    matrixOptions: Option[];
    samplingStageOptions: Option[];
    matrixGroupOptions: Option[];
    superCategorySampleOriginOptions: Option[];
    yearOptions: number[];
    selectedMicroorganisms: string[];
    selectedSampleOrigins: string[];
    selectedMatrices: string[];
    selectedSamplingStages: string[];
    selectedMatrixGroups: string[];
    selectedYear: number[];
    selectedSuperCategory: string[];
    setSelectedMicroorganisms: (microorganisms: string[]) => void;
    setSelectedSampleOrigins: (sampleOrigins: string[]) => void;
    setSelectedMatrices: (matrices: string[]) => void;
    setSelectedSamplingStages: (samplingStages: string[]) => void;
    setSelectedMatrixGroups: (matrixGroups: string[]) => void;
    setSelectedYear: (year: number[]) => void;
    setSelectedSuperCategory: (superCategory: string[]) => void;
    triggerSearch: () => void;
    fetchDataFromAPI: (selectedFilters?: {
        microorganisms: string[];
        sampleOrigins: string[];
        matrices: string[];
        samplingStages: string[];
        matrixGroups: string[];
        years: number[];
        superCategories: string[];
    }) => Promise<void>;
    fetchOptions: () => Promise<void>;
    setIsSearchTriggered: (triggered: boolean) => void;
    prevalenceData: PrevalenceEntry[];
    error: string | null;
    loading: boolean;
    searchParameters: SearchParameters;
    showError: boolean;
    setShowError: (showError: boolean) => void;
    isSearchTriggered: boolean;
}

const DefaultPrevalenceDataContext = createContext<
    PrevalenceDataContext | undefined
>(undefined);

export const usePrevalenceFilters = (): PrevalenceDataContext => {
    const context = useContext(DefaultPrevalenceDataContext);
    if (!context) {
        throw new Error(
            "usePrevalenceFilters must be used within a PrevalenceDataProvider"
        );
    }
    return context;
};

function processApiResponse(
    apiData: CMSEntity<PrevalenceAttributesDTO>[],
    setApiError: (message: string) => void
): PrevalenceEntry[] {
    const validEntries: PrevalenceEntry[] = [];
    const errors: string[] = [];

    apiData.forEach((item: CMSEntity<PrevalenceAttributesDTO>) => {
        try {
            const numberOfPositive =
                item.attributes.numberOfPositive != null
                    ? item.attributes.numberOfPositive
                    : 0;
            const ciMin =
                item.attributes.ciMin != null ? item.attributes.ciMin : 0;
            const ciMax =
                item.attributes.ciMax != null ? item.attributes.ciMax : 0;

            const entry: PrevalenceEntry = {
                id: item.id,
                matrix: item.attributes.matrix.data.attributes.name,
                matrixGroup:
                    item.attributes.matrixGroup?.data.attributes.name ?? "",
                samplingStage:
                    item.attributes.samplingStage.data.attributes.name,
                microorganism:
                    item.attributes.microorganism.data.attributes.name,
                sampleOrigin: item.attributes.sampleOrigin.data.attributes.name,
                samplingYear: item.attributes.samplingYear,
                numberOfSamples: item.attributes.numberOfSamples,
                numberOfPositive: numberOfPositive,
                percentageOfPositive: item.attributes.percentageOfPositive,
                ciMin: ciMin,
                ciMax: ciMax,
                superCategorySampleOrigin:
                    item.attributes.superCategorySampleOrigin?.data.attributes
                        .name ?? "",
            };

            if (
                entry.numberOfSamples > 0 &&
                entry.numberOfPositive >= 0 &&
                entry.percentageOfPositive >= 0
            ) {
                validEntries.push(entry);
            } else {
                errors.push(
                    `Entry with ID ${item.id} contains invalid data. Details: Samples: ${entry.numberOfSamples}, Positives: ${entry.numberOfPositive}, Percentage: ${entry.percentageOfPositive}`
                );
            }
        } catch (err) {
            if (err instanceof Error) {
                errors.push(
                    `Entry with ID ${item.id} could not be processed due to an error: ${err.message}`
                );
            } else {
                errors.push(
                    `Entry with ID ${item.id} could not be processed due to an unknown error.`
                );
            }
        }
    });

    if (errors.length > 0) {
        setApiError("Error processing data: " + errors.join(", "));
    }

    return validEntries;
}

// Define valid keys for filtering
type PrevalenceEntryKey = keyof Pick<
    PrevalenceEntry,
    | "microorganism"
    | "sampleOrigin"
    | "matrix"
    | "samplingStage"
    | "matrixGroup"
    | "superCategorySampleOrigin"
>;

export const PrevalenceDataProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [selectedMicroorganisms, setSelectedMicroorganisms] = useState<
        string[]
    >([]);
    const [selectedSampleOrigins, setSelectedSampleOrigins] = useState<
        string[]
    >([]);
    const [selectedMatrices, setSelectedMatrices] = useState<string[]>([]);
    const [selectedSamplingStages, setSelectedSamplingStages] = useState<
        string[]
    >([]);
    const [selectedMatrixGroups, setSelectedMatrixGroups] = useState<string[]>(
        []
    );
    const [selectedYear, setSelectedYear] = useState<number[]>([]);
    const [selectedSuperCategory, setSelectedSuperCategory] = useState<
        string[]
    >([]);
    const [prevalenceData, setPrevalenceData] = useState<PrevalenceEntry[]>([]);
    const [fullPrevalenceData, setFullPrevalenceData] = useState<
        PrevalenceEntry[]
    >([]);
    const [searchParameters, setSearchParameters] = useState<SearchParameters>(
        {}
    );
    const [microorganismOptions, setMicroorganismOptions] = useState<Option[]>(
        []
    );
    const [sampleOriginOptions, setSampleOriginOptions] = useState<Option[]>(
        []
    );
    const [matrixOptions, setMatrixOptions] = useState<Option[]>([]);
    const [samplingStageOptions, setSamplingStageOptions] = useState<Option[]>(
        []
    );
    const [matrixGroupOptions, setMatrixGroupOptions] = useState<Option[]>([]);
    const [
        superCategorySampleOriginOptions,
        setSuperCategorySampleOriginOptions,
    ] = useState<Option[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [yearOptions, setYearOptions] = useState<number[]>([]);
    const [isSearchTriggered, setIsSearchTriggered] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);

    const fetchPrevalenceData = async (): Promise<void> => {
        try {
            const response = await callApiService<
                CMSResponse<CMSEntity<PrevalenceAttributesDTO>[], unknown>
            >(
                `${PREVALENCES}?populate=*&pagination[pageSize]=${MAX_PAGE_SIZE}`
            );
            if (response.data && response.data.data) {
                const processedData = processApiResponse(
                    response.data.data,
                    setError
                );
                setFullPrevalenceData(processedData);

                // Extract and set unique year options
                const uniqueYears = Array.from(
                    new Set(processedData.map((entry) => entry.samplingYear))
                ).sort((a, b) => a - b);
                setYearOptions(uniqueYears);
            }
        } catch (err) {
            setError(
                `Failed to fetch prevalence data: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`
            );
            console.error(err);
        }
    };

    const fetchOptions = async (): Promise<void> => {
        try {
            const fetchOption = async (endpoint: string): Promise<Option[]> => {
                const response = await callApiService<{
                    data: Array<{
                        id: number;
                        attributes: { name: string };
                    }>;
                }>(endpoint);
                if (response.data && Array.isArray(response.data.data)) {
                    return response.data.data
                        .map((item) => ({
                            name: item.attributes.name,
                        }))
                        .sort((a, b) => a.name.localeCompare(b.name));
                }
                return [];
            };

            const [
                microorganisms,
                sampleOrigins,
                matrices,
                samplingStages,
                matrixGroups,
                superCategories,
            ] = await Promise.all([
                fetchOption(MICROORGANISMS),
                fetchOption(SAMPLE_ORIGINS),
                fetchOption(MATRICES),
                fetchOption(SAMPLING_STAGES),
                fetchOption(MATRIX_GROUPS),
                fetchOption(SUPER_CATEGORY_SAMPLE_ORIGINS),
            ]);

            setMicroorganismOptions(microorganisms);
            setSampleOriginOptions(sampleOrigins);
            setMatrixOptions(matrices);
            setSamplingStageOptions(samplingStages);
            setMatrixGroupOptions(matrixGroups);
            setSuperCategorySampleOriginOptions(superCategories);
        } catch (err) {
            setError(
                `Failed to fetch options: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`
            );
            console.error(err);
        }
    };

    const fetchDataFromAPI = async (selectedFilters?: {
        microorganisms: string[];
        sampleOrigins: string[];
        matrices: string[];
        samplingStages: string[];
        matrixGroups: string[];
        years: number[];
        superCategories: string[];
    }): Promise<void> => {
        setLoading(true);

        // Use the selected filters passed in, or fall back to the state
        const microorganisms =
            selectedFilters?.microorganisms ?? selectedMicroorganisms;
        const sampleOrigins =
            selectedFilters?.sampleOrigins ?? selectedSampleOrigins;
        const matrices = selectedFilters?.matrices ?? selectedMatrices;
        const samplingStages =
            selectedFilters?.samplingStages ?? selectedSamplingStages;
        const matrixGroups =
            selectedFilters?.matrixGroups ?? selectedMatrixGroups;
        const years = selectedFilters?.years ?? selectedYear;
        const superCategories =
            selectedFilters?.superCategories ?? selectedSuperCategory;

        // Check if at least one filter is selected
        const anySelectionMade =
            microorganisms.length > 0 ||
            sampleOrigins.length > 0 ||
            matrices.length > 0 ||
            samplingStages.length > 0 ||
            matrixGroups.length > 0 ||
            superCategories.length > 0 ||
            years.length > 0;

        if (!anySelectionMade) {
            // No selections made; set an error message and stop loading
            setError("Please select at least one filter option.");
            setShowError(true);
            setLoading(false);
            return;
        }

        try {
            let query = `${PREVALENCES}?populate=*&pagination[pageSize]=${MAX_PAGE_SIZE}`;
            const filters: string[] = [];

            const addRelationalFilter = (
                field: string,
                values: string[]
            ): void => {
                if (values.length > 0) {
                    filters.push(
                        values
                            .map(
                                (value) =>
                                    `filters[${field}][name][$eq]=${encodeURIComponent(
                                        value
                                    )}`
                            )
                            .join("&")
                    );
                }
            };

            const addSimpleFilter = (
                field: string,
                values: (string | number)[]
            ): void => {
                if (values.length > 0) {
                    filters.push(
                        values
                            .map(
                                (value) =>
                                    `filters[${field}][$eq]=${encodeURIComponent(
                                        value
                                    )}`
                            )
                            .join("&")
                    );
                }
            };

            addRelationalFilter("microorganism", microorganisms);
            addRelationalFilter("sampleOrigin", sampleOrigins);
            addRelationalFilter("matrix", matrices);
            addRelationalFilter("samplingStage", samplingStages);
            addRelationalFilter("matrixGroup", matrixGroups);
            addRelationalFilter("superCategorySampleOrigin", superCategories);
            addSimpleFilter("samplingYear", years);

            if (filters.length > 0) {
                query += "&" + filters.join("&");
            }

            const response = await callApiService<
                CMSResponse<CMSEntity<PrevalenceAttributesDTO>[], unknown>
            >(query);
            if (response.data && response.data.data) {
                const processedData = processApiResponse(
                    response.data.data,
                    setError
                );
                setPrevalenceData(processedData);
                setSearchParameters({
                    microorganism: microorganisms,
                    sampleOrigin: sampleOrigins,
                    matrix: matrices,
                    samplingStage: samplingStages,
                    matrixGroup: matrixGroups,
                    samplingYear: years.map(String),
                    superCategorySampleOrigin: superCategories,
                });
                setIsSearchTriggered(true);

                // Update the URL with query parameters
                const searchParams = new URLSearchParams();
                for (const [key, values] of Object.entries({
                    microorganism: microorganisms,
                    sampleOrigin: sampleOrigins,
                    matrix: matrices,
                    samplingStage: samplingStages,
                    matrixGroup: matrixGroups,
                    samplingYear: years.map(String),
                    superCategorySampleOrigin: superCategories,
                })) {
                    values.forEach((value) => searchParams.append(key, value));
                }

                // Avoid appending empty `?`
                const searchString = searchParams.toString();
                if (searchString) {
                    window.history.replaceState(null, "", `?${searchString}`);
                } else {
                    window.history.replaceState(
                        null,
                        "",
                        window.location.pathname
                    );
                }
            }
        } catch (err) {
            const fetchError = err as Error;
            setError(`Failed to fetch data: ${fetchError.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect((): void => {
        const initializeData = async (): Promise<void> => {
            setLoading(true);

            try {
                // Fetch options and prevalence data in parallel
                await Promise.all([fetchOptions(), fetchPrevalenceData()]);

                // Extract search parameters from URL when component mounts
                const urlSearchParams = new URLSearchParams(
                    window.location.search
                );
                const params: SearchParameters = {};

                urlSearchParams.forEach((value, key) => {
                    if (!params[key]) {
                        params[key] = [];
                    }
                    params[key].push(value);
                });

                // Store initial selected values
                const initialSelectedMicroorganisms =
                    params.microorganism || [];
                const initialSelectedSampleOrigins = params.sampleOrigin || [];
                const initialSelectedMatrices = params.matrix || [];
                const initialSelectedSamplingStages =
                    params.samplingStage || [];
                const initialSelectedMatrixGroups = params.matrixGroup || [];
                const initialSelectedYear = params.samplingYear
                    ? params.samplingYear.map(Number)
                    : [];
                const initialSelectedSuperCategory =
                    params.superCategorySampleOrigin || [];

                // Set selected values based on URL parameters
                setSelectedMicroorganisms(initialSelectedMicroorganisms);
                setSelectedSampleOrigins(initialSelectedSampleOrigins);
                setSelectedMatrices(initialSelectedMatrices);
                setSelectedSamplingStages(initialSelectedSamplingStages);
                setSelectedMatrixGroups(initialSelectedMatrixGroups);
                setSelectedYear(initialSelectedYear);
                setSelectedSuperCategory(initialSelectedSuperCategory);

                setSearchParameters(params);
                const anyParamsPresent = Object.values(params).some(
                    (arr) => arr.length > 0
                );

                if (anyParamsPresent) {
                    setIsSearchTriggered(true);

                    // Fetch data after filters are set
                    await fetchDataFromAPI({
                        microorganisms: initialSelectedMicroorganisms,
                        sampleOrigins: initialSelectedSampleOrigins,
                        matrices: initialSelectedMatrices,
                        samplingStages: initialSelectedSamplingStages,
                        matrixGroups: initialSelectedMatrixGroups,
                        years: initialSelectedYear,
                        superCategories: initialSelectedSuperCategory,
                    });
                } else {
                    setIsSearchTriggered(false);
                }
            } catch (err) {
                console.error("Error during initialization:", err);
                setError(
                    `Initialization error: ${
                        err instanceof Error ? err.message : "Unknown error"
                    }`
                );
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    useEffect((): void => {
        const updateOptionsBasedOnSelection = (): void => {
            const computeOptions = (
                excludeFilter: PrevalenceEntryKey | "samplingYear",
                getOptionValue: (entry: PrevalenceEntry) => string | number
            ): Option[] => {
                const filtered = fullPrevalenceData.filter((entry) => {
                    const conditions = [
                        excludeFilter !== "microorganism"
                            ? selectedMicroorganisms.length === 0 ||
                              selectedMicroorganisms.includes(
                                  entry.microorganism
                              )
                            : true,
                        excludeFilter !== "sampleOrigin"
                            ? selectedSampleOrigins.length === 0 ||
                              selectedSampleOrigins.includes(entry.sampleOrigin)
                            : true,
                        excludeFilter !== "matrix"
                            ? selectedMatrices.length === 0 ||
                              selectedMatrices.includes(entry.matrix)
                            : true,
                        excludeFilter !== "samplingStage"
                            ? selectedSamplingStages.length === 0 ||
                              selectedSamplingStages.includes(
                                  entry.samplingStage
                              )
                            : true,
                        excludeFilter !== "matrixGroup"
                            ? selectedMatrixGroups.length === 0 ||
                              selectedMatrixGroups.includes(entry.matrixGroup)
                            : true,
                        excludeFilter !== "superCategorySampleOrigin"
                            ? selectedSuperCategory.length === 0 ||
                              selectedSuperCategory.includes(
                                  entry.superCategorySampleOrigin
                              )
                            : true,
                        excludeFilter !== "samplingYear"
                            ? selectedYear.length === 0 ||
                              selectedYear.includes(entry.samplingYear)
                            : true,
                    ];
                    return conditions.every(Boolean);
                });

                const names = Array.from(new Set(filtered.map(getOptionValue)))
                    .map(String)
                    .sort((a, b) => a.localeCompare(b));

                return names.map((name) => ({ name }));
            };

            // Update options for all categories
            setMicroorganismOptions(
                computeOptions("microorganism", (entry) => entry.microorganism)
            );
            setSampleOriginOptions(
                computeOptions("sampleOrigin", (entry) => entry.sampleOrigin)
            );
            setMatrixOptions(computeOptions("matrix", (entry) => entry.matrix));
            setSamplingStageOptions(
                computeOptions("samplingStage", (entry) => entry.samplingStage)
            );
            setMatrixGroupOptions(
                computeOptions("matrixGroup", (entry) => entry.matrixGroup)
            );
            setSuperCategorySampleOriginOptions(
                computeOptions(
                    "superCategorySampleOrigin",
                    (entry) => entry.superCategorySampleOrigin
                )
            );

            // Handle year options
            const years = computeOptions(
                "samplingYear",
                (entry) => entry.samplingYear
            )
                .map((option) => parseInt(option.name, 10))
                .sort((a, b) => a - b);

            setYearOptions(years);
        };

        updateOptionsBasedOnSelection();
    }, [
        selectedMicroorganisms,
        selectedSampleOrigins,
        selectedMatrices,
        selectedSamplingStages,
        selectedMatrixGroups,
        selectedSuperCategory,
        selectedYear,
        fullPrevalenceData,
    ]);

    const triggerSearch = (): void => {
        fetchDataFromAPI();
        setShowError(true);
    };

    const contextValue: PrevalenceDataContext = {
        microorganismOptions,
        sampleOriginOptions,
        matrixOptions,
        samplingStageOptions,
        matrixGroupOptions,
        superCategorySampleOriginOptions,
        yearOptions,
        selectedMicroorganisms,
        setSelectedMicroorganisms,
        selectedSampleOrigins,
        setSelectedSampleOrigins,
        selectedMatrices,
        setSelectedMatrices,
        selectedSamplingStages,
        setSelectedSamplingStages,
        selectedMatrixGroups,
        setSelectedMatrixGroups,
        selectedYear,
        setSelectedYear,
        selectedSuperCategory,
        setSelectedSuperCategory,
        triggerSearch,
        fetchDataFromAPI,
        fetchOptions,
        setIsSearchTriggered,
        prevalenceData: isSearchTriggered ? prevalenceData : [],
        error,
        loading,
        searchParameters,
        showError,
        setShowError,
        isSearchTriggered,
    };

    return (
        <DefaultPrevalenceDataContext.Provider value={contextValue}>
            {children}
        </DefaultPrevalenceDataContext.Provider>
    );
};
