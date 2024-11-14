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
    fetchDataFromAPI: () => void;
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
        setLoading(true);
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
                setPrevalenceData(processedData);

                // Extract and set unique year options
                const uniqueYears = Array.from(
                    new Set(processedData.map((entry) => entry.samplingYear))
                );
                setYearOptions(uniqueYears);
            }
        } catch (err) {
            setError(
                `Failed to fetch prevalence data: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async (): Promise<void> => {
        setLoading(true);
        try {
            const fetchOption = async (endpoint: string): Promise<Option[]> => {
                const response = await callApiService<{
                    data: Array<{
                        id: number;
                        attributes: { name: string };
                    }>;
                }>(endpoint);
                if (response.data && Array.isArray(response.data.data)) {
                    return response.data.data.map((item) => ({
                        name: item.attributes.name,
                    }));
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

            // Fetch prevalence data to update the year options
            await fetchPrevalenceData();
        } catch (err) {
            setError(
                `Failed to fetch options: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect((): void => {
        fetchOptions();
    }, []);

    function filterData(): PrevalenceEntry[] {
        return prevalenceData.filter(
            (entry) =>
                (selectedMicroorganisms.length === 0 ||
                    selectedMicroorganisms.includes(entry.microorganism)) &&
                (selectedSampleOrigins.length === 0 ||
                    selectedSampleOrigins.includes(entry.sampleOrigin)) &&
                (selectedMatrices.length === 0 ||
                    selectedMatrices.includes(entry.matrix)) &&
                (selectedSamplingStages.length === 0 ||
                    selectedSamplingStages.includes(entry.samplingStage)) &&
                (selectedMatrixGroups.length === 0 ||
                    selectedMatrixGroups.includes(entry.matrixGroup)) &&
                (selectedSuperCategory.length === 0 ||
                    selectedSuperCategory.includes(
                        entry.superCategorySampleOrigin
                    )) &&
                (selectedYear.length === 0 ||
                    selectedYear.includes(entry.samplingYear))
        );
    }

    useEffect((): void => {
        const updateOptionsBasedOnSelection = (): void => {
            const baseFilteredData = filterData();

            const generateOptionsForCategory = (
                categoryKey: PrevalenceEntryKey
            ): Option[] => {
                return Array.from(
                    new Set(baseFilteredData.map((entry) => entry[categoryKey]))
                )
                    .filter((name) => name)
                    .map((name) => ({ name: name as string }));
            };

            // Only update the options for categories that are not currently being selected
            setMicroorganismOptions(
                selectedMicroorganisms.length > 0
                    ? microorganismOptions
                    : generateOptionsForCategory("microorganism")
            );
            setSampleOriginOptions(
                selectedSampleOrigins.length > 0
                    ? sampleOriginOptions
                    : generateOptionsForCategory("sampleOrigin")
            );
            setMatrixOptions(
                selectedMatrices.length > 0
                    ? matrixOptions
                    : generateOptionsForCategory("matrix")
            );
            setSamplingStageOptions(
                selectedSamplingStages.length > 0
                    ? samplingStageOptions
                    : generateOptionsForCategory("samplingStage")
            );
            setMatrixGroupOptions(
                selectedMatrixGroups.length > 0
                    ? matrixGroupOptions
                    : generateOptionsForCategory("matrixGroup")
            );
            setSuperCategorySampleOriginOptions(
                selectedSuperCategory.length > 0
                    ? superCategorySampleOriginOptions
                    : generateOptionsForCategory("superCategorySampleOrigin")
            );

            // Handle year options specifically since they're numeric
            setYearOptions(
                selectedYear.length > 0
                    ? yearOptions
                    : Array.from(
                          new Set(
                              baseFilteredData.map(
                                  (entry) => entry.samplingYear
                              )
                          )
                      ).sort((a, b) => a - b)
            );
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
        prevalenceData,
    ]);

    const fetchDataFromAPI = async (): Promise<void> => {
        setLoading(true);
        try {
            let query = `${PREVALENCES}?populate=*&pagination[pageSize]=${MAX_PAGE_SIZE}`;
            const filters: string[] = [];

            const addFilter = (field: string, values: string[]): void => {
                if (values.length > 0) {
                    filters.push(
                        values
                            .map(
                                (value) =>
                                    // Use encodeURIComponent to handle special characters
                                    `filters[${field}][name][$eq]=${encodeURIComponent(
                                        value
                                    )}`
                            )
                            .join("&")
                    );
                }
            };

            addFilter("microorganism", selectedMicroorganisms);
            addFilter("sampleOrigin", selectedSampleOrigins);
            addFilter("matrix", selectedMatrices);
            addFilter("samplingStage", selectedSamplingStages);
            addFilter("matrixGroup", selectedMatrixGroups);
            if (selectedYear.length > 0) {
                filters.push(
                    selectedYear
                        .map((year) => `filters[samplingYear][$eq]=${year}`)
                        .join("&")
                );
            }
            addFilter("superCategorySampleOrigin", selectedSuperCategory);

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
                    microorganism: selectedMicroorganisms,
                    sampleOrigin: selectedSampleOrigins,
                    matrix: selectedMatrices,
                    samplingStage: selectedSamplingStages,
                    matrixGroup: selectedMatrixGroups,
                    samplingYear: selectedYear.map(String),
                    superCategorySampleOrigin: selectedSuperCategory,
                });
                setIsSearchTriggered(true);
            }
        } catch (err) {
            const fetchError = err as Error;
            setError(`Failed to fetch data: ${fetchError.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
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
