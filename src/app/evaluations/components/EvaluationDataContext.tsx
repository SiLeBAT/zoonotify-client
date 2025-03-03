import React, {
    ReactNode,
    createContext,
    useContext,
    useEffect,
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

// 1) "Flat" diagram/csv fields
interface DiagramData {
    id: number;
    url: string;
}
interface EvaluationItem {
    id: number;
    title: string;
    description: string;
    category: string;
    division: string; // "TIERE", "FUTTERMITTEL", ...
    microorganism: string;
    diagramType: string;
    productionType: string;
    matrix: string;
    diagram?: DiagramData;
    csv_data?: DiagramData;
}

// 2) The entire Strapi response
interface EvaluationAPIResponse {
    data: EvaluationItem[];
    meta: unknown;
}

// 3) The internal shapes
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
    updateFilters: (newFilters: FilterSelection) => void;
    showDivision: (division: string) => boolean;
}

export const DefaultEvaluationDataContext =
    createContext<EvaluationDataContext>({
        isLoading: true,
        evaluationsData: {
            FUTTERMITTEL: [],
            TIERE: [],
            LEBENSMITTEL: [],
            MULTIPLE: [],
        },
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

/** Helper: isCompleteEntry if you only want items with both chart + csv. */
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

/** Helper: parse URL query -> FilterSelection */
function parseQueryParams(queryParams: URLSearchParams): FilterSelection {
    const filters: FilterSelection = { ...initialFilterSelection };
    Object.keys(filters).forEach((key) => {
        const param = queryParams.get(key);
        if (param) {
            filters[key as keyof FilterSelection] = param.split(",");
        }
    });
    return filters;
}

/** Helper: build query string from FilterSelection */
function buildQueryString(filters: FilterSelection): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, arr]) => {
        if (arr.length) {
            params.set(key, arr.join(","));
        }
    });
    return params.toString();
}

/** Filter logic */
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

    (Object.keys(data) as (keyof Evaluation)[]).forEach((divisionKey) => {
        filteredData[divisionKey] = data[divisionKey].filter((item) => {
            return (
                Object.keys(filterSelection) as (keyof FilterSelection)[]
            ).every((filterKey) => {
                const selectedVals = filterSelection[filterKey];
                if (selectedVals.length === 0) return true;
                if (item[filterKey] == null) return false;
                return selectedVals.includes(item[filterKey]);
            });
        });
    });

    return filteredData;
}

/** Convert "flat" Strapi data -> internal `Evaluation` structure */
function processApiResponse(apiData: EvaluationItem[]): Evaluation {
    const result: Evaluation = {
        FUTTERMITTEL: [],
        TIERE: [],
        LEBENSMITTEL: [],
        MULTIPLE: [],
    };

    apiData.forEach((item) => {
        // item.division might be "FUTTERMITTEL" | "TIERE" etc.
        // Make sure it's uppercase if needed:
        const divisionKey = item.division.toUpperCase() as keyof Evaluation;
        if (!result[divisionKey]) {
            // If it's an unknown division, skip or treat as MULTIPLE
            return;
        }

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
            division: divisionKey,
            microorganism: item.microorganism,
            diagramType: item.diagramType,
            productionType: item.productionType,
            matrix: item.matrix,
            chartPath,
            dataPath,
        };

        // Only push if it's "complete"
        if (isCompleteEntry(newEntry)) {
            result[divisionKey].push(newEntry);
        }
    });

    return result;
}

/** The main provider */
export const EvaluationDataProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { i18n } = useTranslation(["ExplanationPage"]);

    const [selectedFilters, setSelectedFilters] = useState<FilterSelection>(
        initialFilterSelection
    );
    const [originalData, setOriginalData] = useState<Evaluation>({
        FUTTERMITTEL: [],
        TIERE: [],
        LEBENSMITTEL: [],
        MULTIPLE: [],
    });
    const [evaluationsData, setEvaluationsData] = useState<Evaluation>({
        FUTTERMITTEL: [],
        TIERE: [],
        LEBENSMITTEL: [],
        MULTIPLE: [],
    });
    const [isLoading, setLoading] = useState(true);

    // 1) Fetch data from Strapi (flat shape)
    useEffect(() => {
        const fetchDataFromAPI = async (): Promise<void> => {
            setLoading(true);
            try {
                // Multiple populate
                const url = `${EVALUATIONS}?locale=${i18n.language}&populate=diagram&populate=csv_data&pagination[pageSize]=${MAX_PAGE_SIZE}`;
                const response = await callApiService<EvaluationAPIResponse>(
                    url
                );

                if (response.data) {
                    const processedData = processApiResponse(
                        response.data.data
                    );
                    setOriginalData(processedData);

                    // Parse filters from URL
                    const urlFilters = parseQueryParams(
                        new URLSearchParams(window.location.search)
                    );

                    // If there's at least one non-empty filter array in URL, apply them
                    if (
                        Object.values(urlFilters).some((arr) => arr.length > 0)
                    ) {
                        setSelectedFilters(urlFilters);
                        setEvaluationsData(
                            applyFiltersStrict(urlFilters, processedData)
                        );
                    } else {
                        // No URL filters => show all
                        setEvaluationsData(processedData);
                    }
                }
            } catch (error) {
                console.error("Fetching evaluation data failed", error);
            }
            setLoading(false);
        };

        void fetchDataFromAPI();
    }, [i18n.language]);

    // 2) Whenever selectedFilters changes, re-apply & update URL
    useEffect(() => {
        // Only apply filters if data is loaded
        if (
            !originalData.FUTTERMITTEL.length &&
            !originalData.TIERE.length &&
            !originalData.LEBENSMITTEL.length &&
            !originalData.MULTIPLE.length
        ) {
            return;
        }

        const newData = applyFiltersStrict(selectedFilters, originalData);
        setEvaluationsData(newData);

        // Update URL
        const params = buildQueryString(selectedFilters);
        const newUrl = `${window.location.pathname}${
            params ? `?${params}` : ""
        }`;

        if (newUrl !== window.location.href) {
            window.history.replaceState({}, "", newUrl);
        }
    }, [selectedFilters, originalData]);

    // 3) Public API
    const updateFilters = (newFilters: FilterSelection): void => {
        setSelectedFilters(newFilters);
    };

    const showDivision = (div: string): boolean => {
        // If the division filter is empty, show all
        if (selectedFilters.division.length === 0) return true;
        return selectedFilters.division.includes(div);
    };

    // Final context
    const value: EvaluationDataContext = {
        isLoading,
        evaluationsData,
        updateFilters,
        showDivision,
    };

    return (
        <DefaultEvaluationDataContext.Provider value={value}>
            {children}
        </DefaultEvaluationDataContext.Provider>
    );
};
