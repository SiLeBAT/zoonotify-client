import i18next from "i18next";
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
import {
    CMSEntity,
    CMSResponse,
    MAX_PAGE_SIZE,
} from "../../shared/model/CMS.model";
import {
    Evaluation,
    EvaluationAttributesDTO,
    FilterSelection,
} from "../model/Evaluations.model";
import { initialFilterSelection } from "../model/constants";

/**
 * Context Interface
 */
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

export const EvaluationDataProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { i18n } = useTranslation(["ExplanationPage"]);

    /**
     * --------------------------------------------------
     * Helper functions must be defined before use
     * --------------------------------------------------
     */

    function parseQueryParams(queryParams: URLSearchParams): FilterSelection {
        const filters: FilterSelection = { ...initialFilterSelection };

        Object.keys(filters).forEach((key) => {
            const param = queryParams.get(key);
            if (param) {
                // Split e.g. "dog,cat" => ["dog","cat"]
                filters[key as keyof FilterSelection] = param.split(",");
            }
        });
        return filters;
    }

    function buildQueryString(filters: FilterSelection): string {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, arr]) => {
            if (arr.length) {
                params.set(key, arr.join(","));
            }
        });
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

        (Object.keys(data) as (keyof Evaluation)[]).forEach((divisionKey) => {
            filteredData[divisionKey] = data[divisionKey].filter((item) => {
                // Must pass *all* filters
                return (
                    Object.keys(filterSelection) as (keyof FilterSelection)[]
                ).every((filterKey) => {
                    const selectedVals = filterSelection[filterKey];

                    // If the array is empty => strictly exclude items
                    if (!selectedVals.length) {
                        return false;
                    }
                    // Item must match at least one of the filter's values
                    return selectedVals.includes(item[filterKey]);
                });
            });
        });

        return filteredData;
    }

    function processApiResponse(
        apiData: CMSEntity<EvaluationAttributesDTO>[]
    ): Evaluation {
        const result: Evaluation = {
            FUTTERMITTEL: [],
            TIERE: [],
            LEBENSMITTEL: [],
            MULTIPLE: [],
        };

        apiData.forEach((entry) => {
            const divisionToken = entry.attributes.division as keyof Evaluation;
            if (result[divisionToken]) {
                result[divisionToken].push({
                    id: entry.id.toString(),
                    title: entry.attributes.title,
                    description: entry.attributes.description,
                    category: entry.attributes.category,
                    division: divisionToken,
                    microorganism: entry.attributes.microorganism,
                    diagramType: entry.attributes.diagramType,
                    productionType: entry.attributes.productionType,
                    matrix: entry.attributes.matrix,
                    chartPath:
                        CMS_BASE_ENDPOINT +
                        entry.attributes.diagram.data.attributes.url,
                    dataPath:
                        CMS_BASE_ENDPOINT +
                        entry.attributes.csv_data.data.attributes.url,
                });
            }
        });

        return result;
    }

    /**
     * --------------------------------------------------
     * State Definitions
     * --------------------------------------------------
     */
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

    /**
     * --------------------------------------------------
     * 1. Fetch Data + Parse URL
     * --------------------------------------------------
     */
    useEffect(() => {
        const fetchDataFromAPI = async (): Promise<void> => {
            setLoading(true);
            try {
                const response = await callApiService<
                    CMSResponse<CMSEntity<EvaluationAttributesDTO>[], unknown>
                >(
                    `${EVALUATIONS}?locale=${i18next.language}&populate=diagram,csv_data&pagination[pageSize]=${MAX_PAGE_SIZE}`
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

                    // If there's at least one non-empty filter array in URL, apply them strictly
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
                console.error("Fetching data failed", error);
            }
            setLoading(false);
        };

        void fetchDataFromAPI();
    }, [i18n.language]);

    /**
     * --------------------------------------------------
     * 2. Whenever selectedFilters changes, re-apply & update URL
     * --------------------------------------------------
     */
    useEffect(() => {
        // Only apply filters if data is already loaded
        if (
            !originalData.FUTTERMITTEL.length &&
            !originalData.TIERE.length &&
            !originalData.LEBENSMITTEL.length &&
            !originalData.MULTIPLE.length
        ) {
            return;
        }

        // Apply strict filters
        const newData = applyFiltersStrict(selectedFilters, originalData);
        setEvaluationsData(newData);

        // Update the URL if needed
        const params = buildQueryString(selectedFilters);
        const newUrl = `${window.location.pathname}${
            params ? `?${params}` : ""
        }`;

        if (newUrl !== window.location.href) {
            window.history.replaceState({}, "", newUrl);
        }
    }, [selectedFilters, originalData]);

    /**
     * --------------------------------------------------
     * 3. Public API
     * --------------------------------------------------
     */
    const updateFilters = (newFilters: FilterSelection): void => {
        setSelectedFilters(newFilters);
    };

    const showDivision = (div: string): boolean =>
        selectedFilters.division.includes(div);

    /**
     * --------------------------------------------------
     * Final Context Value
     * --------------------------------------------------
     */
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
