import React, {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import {
    CMS_BASE_ENDPOINT,
    EVALUATIONS,
} from "../../shared/infrastructure/router/routes";
import { MAX_PAGE_SIZE } from "../../shared/model/CMS.model";
import { FilterSelection } from "../model/Evaluations.model";
import { initialFilterSelection } from "../model/constants";

/* ================== API/Types ================== */

interface DiagramData {
    id: number;
    url: string;
}
interface EvaluationItem {
    id: number;
    title: string;
    description: string;
    category: string;
    division: string; // localized string
    microorganism: string;
    diagramType: string;
    productionType: string;
    matrix: string;
    diagram?: DiagramData;
    csv_data?: DiagramData;
}
interface EvaluationAPIResponse {
    data: EvaluationItem[];
    meta: unknown;
}

type DivisionToken = "FUTTERMITTEL" | "TIERE" | "LEBENSMITTEL" | "MULTIPLE";
interface EvaluationEntry {
    id: string;
    title: string;
    description: string;
    category: string;
    division: string;
    microorganism: string;
    diagramType: string;
    productionType: string;
    matrix: string;
    chartPath: string;
    dataPath: string;
}
type Evaluation = Record<DivisionToken, EvaluationEntry[]>;

/** Context Interface */
interface EvaluationDataContext {
    readonly isLoading: boolean;
    readonly evaluationsData: Evaluation;
    readonly selectedFilters: FilterSelection;
    updateFilters: (newFilters: FilterSelection) => void;
    showDivision: (division: string) => boolean;
}

/* ================== Helpers ================== */

const emptyEvaluation: Evaluation = {
    FUTTERMITTEL: [],
    TIERE: [],
    LEBENSMITTEL: [],
    MULTIPLE: [],
};

export const DefaultEvaluationDataContext =
    createContext<EvaluationDataContext>({
        isLoading: true,
        evaluationsData: emptyEvaluation,
        selectedFilters: initialFilterSelection,
        updateFilters: () => {},
        showDivision: () => true,
    });

export const useEvaluationData = (): EvaluationDataContext => {
    const context = useContext(DefaultEvaluationDataContext);
    if (context === undefined) {
        throw new Error(
            "useEvaluationData must be used within an EvaluationDataProvider"
        );
    }
    return context;
};

function isCompleteEntry(entry: {
    title: string;
    description: string;
    category: string;
    chartPath: string;
    dataPath: string;
}): boolean {
    return (
        Boolean(entry.title?.trim()) &&
        Boolean(entry.description?.trim()) &&
        Boolean(entry.category?.trim()) &&
        Boolean(entry.chartPath?.trim()) &&
        Boolean(entry.dataPath?.trim())
    );
}

function parseQueryParams(queryParams: URLSearchParams): FilterSelection {
    const filters: FilterSelection = { ...initialFilterSelection };
    (Object.keys(filters) as (keyof FilterSelection)[]).forEach((key) => {
        const param = queryParams.get(String(key));
        if (param) {
            filters[key] = param.split(",").filter(Boolean);
        }
    });
    return filters;
}

function buildQueryString(filters: FilterSelection): string {
    const params = new URLSearchParams();
    (Object.entries(filters) as [keyof FilterSelection, string[]][]).forEach(
        ([key, arr]) => {
            if (arr.length) {
                params.set(String(key), arr.join(","));
            }
        }
    );
    return params.toString();
}

function applyFiltersStrict(
    filterSelection: FilterSelection,
    data: Evaluation
): Evaluation {
    const filteredData: Evaluation = {
        FUTTERMITTEL: [],
        TIERE: [],
        LEBENSMITTEL: [],
        MULTIPLE: [],
    };

    // If ALL filters are empty, show nothing (reset state)
    const allEmpty = (Object.values(filterSelection) as string[][]).every(
        (arr) => arr.length === 0
    );
    if (allEmpty) return filteredData;

    (Object.keys(data) as (keyof Evaluation)[]).forEach((divisionKey) => {
        filteredData[divisionKey] = data[divisionKey].filter((item) => {
            return (
                Object.keys(filterSelection) as (keyof FilterSelection)[]
            ).every((filterKey) => {
                const selectedVals = filterSelection[filterKey];
                // Empty filter = no constraint on this dimension
                if (selectedVals.length === 0) return true;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((item as any)[filterKey] == null) return false;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return selectedVals.includes((item as any)[filterKey]);
            });
        });
    });

    return filteredData;
}

function processApiResponse(apiData: EvaluationItem[]): Evaluation {
    const result: Evaluation = {
        FUTTERMITTEL: [],
        TIERE: [],
        LEBENSMITTEL: [],
        MULTIPLE: [],
    };

    apiData.forEach((item) => {
        const divisionKey = item.division.toUpperCase() as keyof Evaluation;
        if (!result[divisionKey]) return;

        const chartPath = item.diagram?.url
            ? CMS_BASE_ENDPOINT + item.diagram.url
            : "";
        const dataPath = item.csv_data?.url
            ? CMS_BASE_ENDPOINT + item.csv_data.url
            : "";

        const newEntry: EvaluationEntry = {
            id: item.id.toString(),
            title: item.title,
            description: item.description,
            category: item.category,
            division: String(divisionKey),
            microorganism: item.microorganism,
            diagramType: item.diagramType,
            productionType: item.productionType,
            matrix: item.matrix,
            chartPath,
            dataPath,
        };

        if (isCompleteEntry(newEntry)) {
            result[divisionKey].push(newEntry);
        }
    });

    return result;
}

/* ================== Provider ================== */

export const EvaluationDataProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { i18n } = useTranslation(["ExplanationPage"]);

    const [selectedFilters, setSelectedFilters] = useState<FilterSelection>(
        initialFilterSelection
    );
    const [originalData, setOriginalData] =
        useState<Evaluation>(emptyEvaluation);
    const [evaluationsData, setEvaluationsData] =
        useState<Evaluation>(emptyEvaluation);
    const [isLoading, setLoading] = useState(true);

    // guard against stale fetches overwriting fresh state
    const fetchIdRef = useRef(0);

    // On first mount: align with ?lang=... if present; otherwise write current language to URL.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get("lang");

        if (urlLang && urlLang !== i18n.language) {
            i18n.changeLanguage(urlLang);
        }
        if (!urlLang) {
            params.set("lang", i18n.language);
            const newSearch = `?${params.toString()}`;
            if (newSearch !== window.location.search) {
                window.history.replaceState(
                    {},
                    "",
                    `${window.location.pathname}${newSearch}`
                );
            }
        }
        // run once on mount
    }, []);

    // Fetch data whenever the app language changes.
    // IMPORTANT: Reset filters unless URL explicitly provides them (prevents “no results” after language switch).
    useEffect(() => {
        let isActive = true;
        const myFetchId = ++fetchIdRef.current;

        const fetchDataFromAPI = async (): Promise<void> => {
            setLoading(true);
            try {
                const effectiveLang = i18n.language;
                const url = `${EVALUATIONS}?locale=${effectiveLang}&populate=diagram&populate=csv_data&pagination[pageSize]=${MAX_PAGE_SIZE}`;
                const response = await callApiService<EvaluationAPIResponse>(
                    url
                );

                if (!isActive || myFetchId !== fetchIdRef.current) return;

                if (response.data) {
                    const processedData = processApiResponse(
                        response.data.data
                    );
                    setOriginalData(processedData);

                    const urlFilters = parseQueryParams(
                        new URLSearchParams(window.location.search)
                    );
                    const hasUrlFilters = Object.values(urlFilters).some(
                        (arr) => arr.length > 0
                    );

                    if (hasUrlFilters) {
                        // honor deep links
                        setSelectedFilters(urlFilters);
                        setEvaluationsData(
                            applyFiltersStrict(urlFilters, processedData)
                        );
                    } else {
                        // RESET filters on language change so results are visible immediately
                        setSelectedFilters(initialFilterSelection);
                        setEvaluationsData(processedData);
                    }
                }
            } catch (error) {
                console.error("Fetching evaluation data failed", error);
            } finally {
                if (isActive && myFetchId === fetchIdRef.current) {
                    setLoading(false);
                }
            }
        };

        void fetchDataFromAPI();
        return () => {
            isActive = false;
        };
    }, [i18n.language]);

    // Re-apply filters on any state change and keep URL (including lang) in sync
    useEffect(() => {
        const hasData =
            originalData.FUTTERMITTEL.length ||
            originalData.TIERE.length ||
            originalData.LEBENSMITTEL.length ||
            originalData.MULTIPLE.length;
        if (!hasData) return;

        const newData = applyFiltersStrict(selectedFilters, originalData);
        setEvaluationsData(newData);

        const filterQuery = buildQueryString(selectedFilters);
        const searchParams = new URLSearchParams(filterQuery);
        searchParams.set("lang", i18n.language);

        const newSearch = `?${searchParams.toString()}`;
        if (newSearch !== window.location.search) {
            window.history.replaceState(
                {},
                "",
                `${window.location.pathname}${newSearch}`
            );
        }
    }, [selectedFilters, originalData, i18n.language]);

    const updateFilters = (newFilters: FilterSelection): void => {
        setSelectedFilters(newFilters);
    };

    const showDivision = (div: string): boolean => {
        if (selectedFilters.division.length === 0) return true;
        return selectedFilters.division.includes(div);
    };

    const value: EvaluationDataContext = {
        isLoading,
        evaluationsData,
        selectedFilters,
        updateFilters,
        showDivision,
    };

    return (
        <DefaultEvaluationDataContext.Provider value={value}>
            {children}
        </DefaultEvaluationDataContext.Provider>
    );
};
