import i18next from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    CMS_BASE_ENDPOINT,
    EVALUATIONS,
    EVALUATION_INFO,
} from "../../shared/infrastructure/router/routes";
import {
    Evaluation,
    EvaluationAttributesDTO,
    EvaluationInformationAttributesDTO,
    FilterSelection,
    SelectionFilterConfig,
    SelectionItem,
} from "../model/Evaluations.model";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse, CMSEntity } from "../../shared/model/CMS.model";

const maxPageSize = 250;
const microorganism = [
    "E_COLI",
    "CAMPYLOBACTER_SPP",
    "ESBL_AMPC_E_COLI",
    "LISTERIS_MONOCYTOGENES",
    "MRSA",
    "SALMONELLA_SPP",
    "STEC",
    "CARBA_E_COLI",
    "ENTEROCOCCUS_SPP",
];
const category = ["HUHN", "PUTE", "SCHWEIN", "RIND", "DIVERSE"];
const diagramType = [
    "MDR",
    "ERREGERCHARAK",
    "SUBSTANZ_GRAPH",
    "TREND_DIAGRAMM",
];
const productionType = [
    "LEGEHENNEN",
    "MASTHAEHNCHEN",
    "MASTKALB_JUNGRIND",
    "MASTRIND",
    "MASTPUTEN",
    "MASTSCHWEIN",
    "RIND",
    "ZUCHTHUEHNER_LEGE_UND_MASTLINIE",
    "MILCHRIND",
    "DIVERSE",
];
const matrix = [
    "BLINDDARMINHALT",
    "FRISCHES_FLEISCH",
    "HACKFLEISCH",
    "KOT_STAUB",
    "SCHLACHTKOERPER",
    "HALS_HAUT",
    "MILCH",
    "MULTIPLE",
];
const division = ["FUTTERMITTEL", "TIERE", "LEBENSMITTEL", "MULTIPLE"];
const initialFilterSelection: FilterSelection = {
    matrix,
    productionType,
    diagramType,
    category,
    microorganism,
    division,
};

function toSelectionItem(
    stringItems: string[],
    translate: (key: string) => string
): SelectionItem[] {
    return stringItems.map((item) => ({
        value: item,
        displayName: translate(item),
    }));
}

const useEvaluationPageComponent = (): {
    model: {
        downloadDataButtonText: string;
        downloadGraphButtonText: string;
        searchButtonText: string;
        filterButtonText: string;
        heading: string;
        evaluationsData: Evaluation;
        selectionConfig: SelectionFilterConfig[];
        selectedFilters: FilterSelection;
        loading: boolean;
        howto: string;
        howToHeading: string;
    };
    operations: {
        showDivision: (div: string) => boolean;
        fetchData: (filter: FilterSelection) => void;
        updateFilters: (newFilters: FilterSelection) => void;
    };
} => {
    const { t, i18n } = useTranslation(["ExplanationPage"]);
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
    const [selectedFilters, setSelectedFilters] = useState<FilterSelection>(
        initialFilterSelection
    );
    const [loading, setLoading] = useState(true);
    const [howtoContent, setHowtoContent] = useState("");

    const availableOptions = {
        matrix: toSelectionItem(matrix, t),
        productionType: toSelectionItem(productionType, t),
        diagramType: toSelectionItem(diagramType, t),
        category: toSelectionItem(category, t),
        microorganism: toSelectionItem(microorganism, t),
        division: toSelectionItem(division, t),
    };

    const fetchDataFromAPI = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await callApiService<
                CMSResponse<CMSEntity<EvaluationAttributesDTO>[], unknown>
            >(
                `${EVALUATIONS}?locale=${i18next.language}&populate=diagram,csv_data&pagination[pageSize]=${maxPageSize}`
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
                        return (
                            filterSelection[key].length === 0 ||
                            filterSelection[key].includes(item[key])
                        );
                    });
                }
            );
        });
        setEvaluationsData(filteredData);
    };
    const handleChange =
        (key: keyof FilterSelection) =>
        (value: string | string[]): void => {
            const newValue = Array.isArray(value) ? value : [value];
            setSelectedFilters((prev) => ({
                ...prev,
                [key]: newValue,
            }));
        };

    const selectionConfig: SelectionFilterConfig[] = Object.keys(
        selectedFilters
    ).map((key) => {
        return {
            label: t(key.toUpperCase()),
            id: key,
            selectedItems: selectedFilters[key as keyof FilterSelection],
            selectionOptions:
                availableOptions[key as keyof typeof availableOptions],
            handleChange: (event) => {
                const value = event.target.value;
                handleChange(key as keyof FilterSelection)(value);
            },
        };
    });
    useEffect(() => {
        callApiService<
            CMSResponse<CMSEntity<EvaluationInformationAttributesDTO>, unknown>
        >(`${EVALUATION_INFO}?locale=${i18next.language}`)
            .then((response) => {
                if (response.data) {
                    const data = response.data.data;
                    setHowtoContent(data.attributes.content);
                }
                return response; // Ensure to return a value
            })
            .catch((error) => {
                console.error("Error fetching 'How To' content", error);
                throw error; // Ensure to throw an error
            });
    }, [i18next.language]);

    const updateFilters = (newFilters: FilterSelection): void => {
        setSelectedFilters(newFilters);
        applyFilters(newFilters);
    };

    return {
        model: {
            downloadDataButtonText: t("Data_Download"),
            downloadGraphButtonText: t("Export"),
            searchButtonText: t("Filter"),
            filterButtonText: t("Filter"),
            heading: t("Heading"),
            evaluationsData,
            selectionConfig,
            selectedFilters,
            loading,
            howto: howtoContent,
            howToHeading: t("HOW_TO"),
        },
        operations: {
            showDivision: (div: string) =>
                selectedFilters.division.includes(div),
            fetchData: applyFilters,
            updateFilters,
        },
    };
};

export { useEvaluationPageComponent };
