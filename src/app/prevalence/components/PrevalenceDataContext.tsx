import i18next from "i18next";
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
import { MAX_PAGE_SIZE } from "../../shared/model/CMS.model";

/** 1) A simple "Matrix"-style interface for each relation */
interface Matrix {
    id: number; // locale-specific id
    name: string; // localized label
    documentId?: string; // locale-agnostic id (same across locales)
}

/** 2) A single "flat" Prevalence item from Strapi v5 */
interface PrevalenceItem {
    id: number;
    samplingYear: number;
    numberOfSamples: number;
    numberOfPositive: number;
    percentageOfPositive: number;
    ciMin: number;
    ciMax: number;
    matrix?: Matrix;
    matrixDetail?: Matrix;
    matrixGroup?: Matrix;
    microorganism?: Matrix;
    samplingStage?: Matrix;
    sampleOrigin?: Matrix;
    superCategorySampleOrigin?: Matrix;
}

/** 3) Entire Strapi response for "Prevalences" */
interface PrevalenceAPIResponse {
    data: PrevalenceItem[];
    meta: unknown;
}

/** 4) The final object your front end uses */
export type PrevalenceEntry = {
    id: number;
    samplingYear: number;
    numberOfSamples: number;
    numberOfPositive: number;
    percentageOfPositive: number;
    ciMin: number;
    ciMax: number;

    matrix: string;
    matrixDocId?: string;

    matrixGroup: string;
    matrixGroupDocId?: string;

    samplingStage: string;
    samplingStageDocId?: string;

    sampleOrigin: string;
    sampleOriginDocId?: string;

    microorganism: string;
    microorganismDocId?: string;

    superCategorySampleOrigin: string;
    superCategorySampleOriginDocId?: string;
};

export type SearchParameters = Record<string, string[]>;

interface Option {
    documentId: string; // value (stable across locales)
    name: string; // label (localized)
}

/** 5) The shape of your React context */
interface PrevalenceDataContext {
    microorganismOptions: Option[];
    sampleOriginOptions: Option[];
    matrixOptions: Option[];
    samplingStageOptions: Option[];
    matrixGroupOptions: Option[];
    superCategorySampleOriginOptions: Option[];
    yearOptions: number[];
    selectedMicroorganisms: string[]; // docIds
    selectedSampleOrigins: string[]; // docIds
    selectedMatrices: string[]; // docIds
    selectedSamplingStages: string[]; // docIds
    selectedMatrixGroups: string[]; // docIds
    selectedYear: number[];
    selectedSuperCategory: string[]; // docIds
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
    prevalenceUpdateDate: string | null;
}

/** The React context */
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

/** 6) Convert the "flat" Prevalence items into your PrevalenceEntry shape */
function processApiResponse(
    apiData: PrevalenceItem[],
    setApiError: (message: string) => void
): PrevalenceEntry[] {
    const validEntries: PrevalenceEntry[] = [];
    const errors: string[] = [];

    apiData.forEach((item) => {
        try {
            const entry: PrevalenceEntry = {
                id: item.id,
                samplingYear: item.samplingYear ?? 0,
                numberOfSamples: item.numberOfSamples ?? 0,
                numberOfPositive: item.numberOfPositive ?? 0,
                percentageOfPositive: item.percentageOfPositive ?? 0,
                ciMin: item.ciMin ?? 0,
                ciMax: item.ciMax ?? 0,

                matrix: item.matrix?.name ?? "",
                matrixDocId: item.matrix?.documentId,

                matrixGroup: item.matrixGroup?.name ?? "",
                matrixGroupDocId: item.matrixGroup?.documentId,

                microorganism: item.microorganism?.name ?? "",
                microorganismDocId: item.microorganism?.documentId,

                samplingStage: item.samplingStage?.name ?? "",
                samplingStageDocId: item.samplingStage?.documentId,

                sampleOrigin: item.sampleOrigin?.name ?? "",
                sampleOriginDocId: item.sampleOrigin?.documentId,

                superCategorySampleOrigin:
                    item.superCategorySampleOrigin?.name ?? "",
                superCategorySampleOriginDocId:
                    item.superCategorySampleOrigin?.documentId,
            };
            validEntries.push(entry);
        } catch (err) {
            errors.push(`Error processing item ID ${item.id}: ${err}`);
        }
    });

    if (errors.length > 0) {
        setApiError(errors.join(", "));
    }
    return validEntries;
}

/** 7) The main PrevalenceDataProvider */
export const PrevalenceDataProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    // -------------- Language Setup --------------
    useEffect(() => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const langParam = urlSearchParams.get("lang");
        if (langParam && langParam !== i18next.language) {
            i18next.changeLanguage(langParam);
        }
        if (!langParam) {
            urlSearchParams.set("lang", i18next.language);
            window.history.replaceState(
                null,
                "",
                `?${urlSearchParams.toString()}`
            );
        }
    }, []);

    // -------------- State --------------
    const [selectedMicroorganisms, setSelectedMicroorganisms] = useState<
        string[]
    >([]); // docIds
    const [selectedSampleOrigins, setSelectedSampleOrigins] = useState<
        string[]
    >([]); // docIds
    const [selectedMatrices, setSelectedMatrices] = useState<string[]>([]); // docIds
    const [selectedSamplingStages, setSelectedSamplingStages] = useState<
        string[]
    >([]); // docIds
    const [selectedMatrixGroups, setSelectedMatrixGroups] = useState<string[]>(
        []
    ); // docIds
    const [selectedYear, setSelectedYear] = useState<number[]>([]);
    const [selectedSuperCategory, setSelectedSuperCategory] = useState<
        string[]
    >([]); // docIds

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
    const [prevalenceUpdateDate, setPrevalenceUpdateDate] = useState<
        string | null
    >(null);

    // -------------- 1) fetchPrevalenceData --------------
    const fetchPrevalenceData = async (): Promise<void> => {
        try {
            const relationsToPopulate = [
                "matrix",
                "microorganism",
                "samplingStage",
                "matrixGroup",
                "sampleOrigin",
                "superCategorySampleOrigin",
            ];
            const populateParams = relationsToPopulate
                .map((relation) => `populate=${relation}`)
                .join("&");

            const url = `${PREVALENCES}?locale=${i18next.language}&${populateParams}&pagination[pageSize]=${MAX_PAGE_SIZE}`;
            const response = await callApiService<PrevalenceAPIResponse>(url);

            if (response.data && response.data.data) {
                const processedData = processApiResponse(
                    response.data.data,
                    setError
                );
                setFullPrevalenceData(processedData);
                setPrevalenceData(processedData);
            }
        } catch (err) {
            console.error("Error fetching prevalence data:", err);
        }
    };

    // -------------- 2) fetchPrevalenceUpdateDate --------------
    interface PrevalenceUpdateFlatResponse {
        data: {
            id: number;
            date: string;
        };
        meta: unknown;
    }

    const fetchPrevalenceUpdateDate = async (): Promise<void> => {
        try {
            const baseUrl = process.env.REACT_APP_API_URL;
            const url = `${baseUrl}/api/prevelence-update`;
            const response = await callApiService<PrevalenceUpdateFlatResponse>(
                url
            );

            if (response.data?.data?.date) {
                setPrevalenceUpdateDate(response.data.data.date || null);
            } else {
                console.log("Date not found in response data.");
            }
        } catch (err) {
            console.error("Error fetching Prevalence-update date:", err);
        }
    };

    // -------------- 3) fetchOptions --------------
    const fetchOptions = async (): Promise<void> => {
        try {
            const fetchOption = async (endpoint: string): Promise<Option[]> => {
                const response = await callApiService<{
                    data: Array<{
                        id: number;
                        name?: string;
                        documentId?: string;
                        attributes?: { name: string; documentId?: string };
                    }>;
                }>(`${endpoint}?locale=${i18next.language}`);

                if (response.data && Array.isArray(response.data.data)) {
                    return response.data.data
                        .map((item) => {
                            const name =
                                item.name ?? item.attributes?.name ?? "";
                            const documentId =
                                (item.documentId ??
                                    item.attributes?.documentId ??
                                    "") + "";
                            return { name, documentId };
                        })
                        .filter((o) => o.name && o.documentId);
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

    // -------------- 4) fetchDataFromAPI (with filters) --------------
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

        const anySelectionMade =
            microorganisms.length > 0 ||
            sampleOrigins.length > 0 ||
            matrices.length > 0 ||
            samplingStages.length > 0 ||
            matrixGroups.length > 0 ||
            superCategories.length > 0 ||
            years.length > 0;

        if (!anySelectionMade) {
            setError("Please select at least one filter option.");
            setShowError(true);
            setLoading(false);
            return;
        }

        try {
            let query = `${PREVALENCES}?locale=${i18next.language}&pagination[pageSize]=${MAX_PAGE_SIZE}`;
            const filters: string[] = [];

            // Filter relations by documentId (locale-agnostic, stable)
            const addRelationalFilter = (
                field: string,
                docIds: string[]
            ): void => {
                if (docIds.length > 0) {
                    // Repeat $in param (Strapi accepts repeated $in keys)
                    docIds.forEach((docId) =>
                        filters.push(
                            `filters[${field}][documentId][$in]=${encodeURIComponent(
                                docId
                            )}`
                        )
                    );
                }
            };

            // Numeric field
            const addSimpleFilter = (
                field: string,
                values: (string | number)[]
            ): void => {
                if (values.length > 0) {
                    values.forEach((value) =>
                        filters.push(
                            `filters[${field}][$eq]=${encodeURIComponent(
                                value
                            )}`
                        )
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

            const relationsToPopulate = [
                "matrix",
                "microorganism",
                "samplingStage",
                "matrixGroup",
                "sampleOrigin",
                "superCategorySampleOrigin",
            ];
            const populateParams = relationsToPopulate
                .map((relation) => `populate=${relation}`)
                .join("&");

            query += `&${populateParams}`;

            const response = await callApiService<PrevalenceAPIResponse>(query);
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
                // persist lang in URL
                searchParams.set("lang", i18next.language);
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

    // -------------- 5) Initialization --------------
    useEffect(() => {
        const initializeData = async (): Promise<void> => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchOptions(),
                    fetchPrevalenceData(),
                    fetchPrevalenceUpdateDate(),
                ]);

                const urlSearchParams = new URLSearchParams(
                    window.location.search
                );
                const params: SearchParameters = {};
                urlSearchParams.forEach((value, key) => {
                    if (!params[key]) params[key] = [];
                    params[key].push(value);
                });

                const initialSelectedMicroorganisms =
                    params.microorganism || []; // docIds
                const initialSelectedSampleOrigins = params.sampleOrigin || []; // docIds
                const initialSelectedMatrices = params.matrix || []; // docIds
                const initialSelectedSamplingStages =
                    params.samplingStage || []; // docIds
                const initialSelectedMatrixGroups = params.matrixGroup || []; // docIds
                const initialSelectedYear = params.samplingYear
                    ? params.samplingYear.map(Number)
                    : [];
                const initialSelectedSuperCategory =
                    params.superCategorySampleOrigin || []; // docIds

                setSelectedMicroorganisms(initialSelectedMicroorganisms);
                setSelectedSampleOrigins(initialSelectedSampleOrigins);
                setSelectedMatrices(initialSelectedMatrices);
                setSelectedSamplingStages(initialSelectedSamplingStages);
                setSelectedMatrixGroups(initialSelectedMatrixGroups);
                setSelectedYear(initialSelectedYear);
                setSelectedSuperCategory(initialSelectedSuperCategory);

                setSearchParameters(params);
                const anyParamsPresent = Object.entries(params).some(
                    ([k, arr]) =>
                        k !== "lang" && Array.isArray(arr) && arr.length > 0
                );

                if (anyParamsPresent) {
                    setIsSearchTriggered(true);
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
        void initializeData();
    }, []);

    // -------------- 6) Recompute Options Based on Selection --------------

    useEffect(() => {
        const updateOptionsBasedOnSelection = (): void => {
            const dataToCompute = isSearchTriggered
                ? prevalenceData
                : fullPrevalenceData;

            const filteredBySelections = dataToCompute.filter((entry) => {
                const conds = [
                    selectedMicroorganisms.length === 0 ||
                        selectedMicroorganisms.includes(
                            entry.microorganismDocId ?? ""
                        ),
                    selectedSampleOrigins.length === 0 ||
                        selectedSampleOrigins.includes(
                            entry.sampleOriginDocId ?? ""
                        ),
                    selectedMatrices.length === 0 ||
                        selectedMatrices.includes(entry.matrixDocId ?? ""),
                    selectedSamplingStages.length === 0 ||
                        selectedSamplingStages.includes(
                            entry.samplingStageDocId ?? ""
                        ),
                    selectedMatrixGroups.length === 0 ||
                        selectedMatrixGroups.includes(
                            entry.matrixGroupDocId ?? ""
                        ),
                    selectedSuperCategory.length === 0 ||
                        selectedSuperCategory.includes(
                            entry.superCategorySampleOriginDocId ?? ""
                        ),
                    selectedYear.length === 0 ||
                        selectedYear.includes(entry.samplingYear),
                ];
                return conds.every(Boolean);
            });

            // Build options maps docId -> name (label)
            const toMapAdd = (
                map: Map<string, string>,
                docId?: string,
                name?: string
            ): void => {
                if (docId && name && !map.has(docId)) map.set(docId, name);
            };

            const microMap = new Map<string, string>();
            const soMap = new Map<string, string>();
            const mMap = new Map<string, string>();
            const stageMap = new Map<string, string>();
            const groupMap = new Map<string, string>();
            const superMap = new Map<string, string>();
            const yearsSet = new Set<number>();

            filteredBySelections.forEach((e) => {
                toMapAdd(microMap, e.microorganismDocId, e.microorganism);
                toMapAdd(soMap, e.sampleOriginDocId, e.sampleOrigin);
                toMapAdd(mMap, e.matrixDocId, e.matrix);
                toMapAdd(stageMap, e.samplingStageDocId, e.samplingStage);
                toMapAdd(groupMap, e.matrixGroupDocId, e.matrixGroup);
                toMapAdd(
                    superMap,
                    e.superCategorySampleOriginDocId,
                    e.superCategorySampleOrigin
                );
                yearsSet.add(e.samplingYear);
            });

            const mapToOptions = (m: Map<string, string>): Option[] =>
                Array.from(m.entries())
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([documentId, name]) => ({ documentId, name }));

            setMicroorganismOptions(mapToOptions(microMap));
            setSampleOriginOptions(mapToOptions(soMap));
            setMatrixOptions(mapToOptions(mMap));
            setSamplingStageOptions(mapToOptions(stageMap));
            setMatrixGroupOptions(mapToOptions(groupMap));
            setSuperCategorySampleOriginOptions(mapToOptions(superMap));

            const years = Array.from(yearsSet).sort((a, b) => a - b);
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
        prevalenceData,
        isSearchTriggered,
    ]);

    // -------------- 7) Trigger Search --------------
    const triggerSearch = (): void => {
        fetchDataFromAPI();
        setShowError(true);
    };

    // -------------- 8) Re-fetch if language changes --------------
    useEffect(() => {
        if (isSearchTriggered) {
            // Re-run search using current filters when language changes
            fetchDataFromAPI({
                microorganisms: selectedMicroorganisms,
                sampleOrigins: selectedSampleOrigins,
                matrices: selectedMatrices,
                samplingStages: selectedSamplingStages,
                matrixGroups: selectedMatrixGroups,
                years: selectedYear,
                superCategories: selectedSuperCategory,
            });
        } else {
            // If no search is active, just fetch the raw data and options
            fetchPrevalenceData();
            fetchOptions();
            fetchPrevalenceUpdateDate();
        }
        // Update URL to reflect the current language
        const urlSearchParams = new URLSearchParams(window.location.search);
        urlSearchParams.set("lang", i18next.language);
        window.history.replaceState(null, "", `?${urlSearchParams.toString()}`);
    }, [i18next.language]);

    // -------------- 9) Final context value --------------
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
        prevalenceUpdateDate,
    };

    return (
        <DefaultPrevalenceDataContext.Provider value={contextValue}>
            {children}
        </DefaultPrevalenceDataContext.Provider>
    );
};
