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
        showDivision: (div: string) => (div ? true : true),
    });

export const useEvaluationData = (): EvaluationDataContext => {
    const context = useContext(DefaultEvaluationDataContext);
    if (context === undefined) {
        throw new Error(
            "useEvaluationFilters must be used within a EvaluationDataProvider"
        );
    }
    return context;
};

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

    const fetchDataFromAPI = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await callApiService<
                CMSResponse<CMSEntity<EvaluationAttributesDTO>[], unknown>
            >(
                `${EVALUATIONS}?locale=${i18next.language}&populate=diagram,csv_data&pagination[pageSize]=${MAX_PAGE_SIZE}`
            );
            if (response.data) {
                const processedData = processApiResponse(response.data.data);
                setOriginalData(processedData);
                setEvaluationsData(processedData);
            }
        } catch (error) {
            console.error("Fetching data failed", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDataFromAPI();
    }, []);

    useEffect(() => {
        const handleLanguageChange = (): void => {
            fetchDataFromAPI();
        };

        i18n.on("languageChanged", handleLanguageChange);

        return () => {
            i18n.off("languageChanged", handleLanguageChange);
        };
    }, [i18n]);

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

    const applyFilters = (filterSelection: FilterSelection): void => {
        const filteredData: Evaluation = {
            FUTTERMITTEL: [],
            TIERE: [],
            LEBENSMITTEL: [],
            MULTIPLE: [],
        };
        Object.keys(originalData).forEach((divisionKey) => {
            const divisionValue = divisionKey as keyof Evaluation;
            filteredData[divisionValue] = originalData[divisionValue].filter(
                (item) => {
                    return Object.keys(filterSelection).every((filterKey) => {
                        const key = filterKey as keyof FilterSelection;
                        return filterSelection[key].includes(item[key]);
                    });
                }
            );
        });
        setEvaluationsData(filteredData);
    };

    const showDivision = (div: string): boolean =>
        selectedFilters.division.includes(div);

    const updateFilters = (newFilters: FilterSelection): void => {
        setSelectedFilters(newFilters);
        applyFilters(newFilters);
    };

    const value = {
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
