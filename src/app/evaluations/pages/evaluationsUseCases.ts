import {
    CMS_BASE_ENDPOINT,
    EVALUATIONS,
    EVALUATION_INFO,
} from "./../../shared/infrastructure/router/routes";
import {
    DivisionToken,
    Evaluation,
    EvaluationAttributesDTO,
    EvaluationInformationAttributesDTO,
    FilterSelection,
    SelectionFilterConfig,
    SelectionItem,
} from "./../model/Evaluations.model";
// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSEntity, CMSResponse } from "../../shared/model/CMS.model";
import { UseCase } from "../../shared/model/UseCases";

type EvaluationPageModel = {
    downloadGraphButtonText: string;
    downloadDataButtonText: string;
    filterButtonText: string;
    searchButtonText: string;
    heading: Record<string, string>;
    evaluationsData: Evaluation;
    selectionConfig: SelectionFilterConfig[];
    selectedFilters: FilterSelection;
    loading: boolean;
    howto: string;
};

type EvaluationPageOperations = {
    showDivision: (division: string) => boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchData: (filter: FilterSelection) => any;
};

type EvaluationPageTranslations = {
    downloadDataButtonText: string;
    downloadGraphButtonText: string;
    filterButtonText: string;
    searchButtonText: string;
    heading: Record<string, string>;
};

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
function getTranslations(t: TFunction): EvaluationPageTranslations {
    const downloadGraphButtonText = t("Export");
    const downloadDataButtonText = t("Data_Download");
    const searchButtonText = t("Search");
    const filterButtonText = t("Filter");
    const heading = {
        main: t("Heading"),
        FUTTERMITTEL: t("FUTTERMITTEL"),
        TIERE: t("TIERE"),
        LEBENSMITTEL: t("LEBENSMITTEL"),
        MULTIPLE: t("MULTIPLE"),
    };
    return {
        downloadGraphButtonText,
        downloadDataButtonText,
        heading,
        searchButtonText,
        filterButtonText,
    };
}

function toSelectionItem(stringItems: string[], t: TFunction): SelectionItem[] {
    return stringItems.map((item: string) => ({
        value: item,
        displayName: t(item),
    }));
}

const useEvaluationPageComponent: UseCase<
    null,
    EvaluationPageModel,
    EvaluationPageOperations
> = () => {
    const { t } = useTranslation(["ExplanationPage"]);

    const [howto, setHowto] = useState("");

    const emptyDivisions: Evaluation = {
        FUTTERMITTEL: [],
        TIERE: [],
        LEBENSMITTEL: [],
        MULTIPLE: [],
    };

    const [evaluationsData, setEvaluationsData] = useState({
        ...emptyDivisions,
    });

    const availableOptions = {
        matrix: toSelectionItem(matrix, t),
        productionType: toSelectionItem(productionType, t),
        diagramType: toSelectionItem(diagramType, t),
        category: toSelectionItem(category, t),
        microorganism: toSelectionItem(microorganism, t),
        division: toSelectionItem(division, t),
    };

    const {
        downloadGraphButtonText,
        downloadDataButtonText,
        heading,
        searchButtonText,
        filterButtonText,
    } = getTranslations(t);

    const [selectedFilters, setSelectedFilters] = useState(
        initialFilterSelection
    );

    const [loading, setLoading] = useState(true);

    const createQueryString = (selection: FilterSelection): string => {
        const result = Object.entries(selection)
            .map(([key, value]) => {
                if (value.length === 0) {
                    return "filters[" + key + "][$eq]=" + "NULL&";
                }
                return value
                    .map((v) => "filters[" + key + "][$eq]=" + v)
                    .join("&");
            })
            .join("&");
        return result;
    };

    const fetchData = (filter: FilterSelection): void => {
        const qString = createQueryString(filter);

        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any

        callApiService<
            CMSResponse<CMSEntity<EvaluationAttributesDTO>[], unknown>
        >(
            `${EVALUATIONS}?locale=${i18next.language}&populate=diagram,csv_data&${qString}&pagination[pageSize]=${maxPageSize}`
        )
            .then((response) => {
                const result: Evaluation = {
                    ...emptyDivisions,
                };
                if (response.data) {
                    const data = response.data.data;
                    // Assuming the title is a direct attribute of entry.attributes, adjust if necessary.
                    // Sorting before processing each entry.
                    const sortedData = data.sort((a, b) => {
                        const titleA = a.attributes.title.toUpperCase(); // Assuming 'title' is the attribute
                        const titleB = b.attributes.title.toUpperCase();
                        return titleA.localeCompare(titleB);
                    });

                    sortedData.forEach(
                        (entry: CMSEntity<EvaluationAttributesDTO>) => {
                            const divisionToken: DivisionToken = entry
                                .attributes.division as DivisionToken;
                            if (result[divisionToken]) {
                                if (entry.attributes.diagram.data !== null) {
                                    result[divisionToken].push({
                                        ...entry.attributes,
                                        chartPath:
                                            CMS_BASE_ENDPOINT +
                                            entry.attributes.diagram.data
                                                .attributes.url,
                                        dataPath:
                                            CMS_BASE_ENDPOINT +
                                            entry.attributes.csv_data.data
                                                .attributes.url,
                                    });
                                }
                            }
                        }
                    );
                }
                setEvaluationsData(result);
                setLoading(false);
                return result;
            })
            .catch((error) => {
                setLoading(false);
                throw error;
            });
    };

    const availableFilters = [
        "otherDetail",
        "matrix",
        "productionType",
        "diagramType",
        "category",
        "microorganism",
        "division",
    ];

    const selectionConfig: SelectionFilterConfig[] = availableFilters.map(
        (filter) => ({
            label: t(filter.toUpperCase()),
            id: filter,
            selectedItems: selectedFilters[filter as keyof FilterSelection],
            selectionOptions: availableOptions[filter as keyof FilterSelection],
            handleChange: (event: { target: { value: string } }): void => {
                const {
                    target: { value },
                } = event;

                setSelectedFilters((prev) => {
                    const newFilters = { ...prev };
                    newFilters[filter as keyof FilterSelection] =
                        typeof value === "string" ? value.split(",") : value;

                    return newFilters;
                });
            },
        })
    );

    const showDivision = (div: string): boolean => {
        return selectedFilters.division.includes(div);
    };

    useEffect(() => {
        callApiService<
            CMSResponse<CMSEntity<EvaluationInformationAttributesDTO>, unknown>
        >(`${EVALUATION_INFO}?locale=${i18next.language}`)
            .then((response) => {
                if (response.data) {
                    const data = response.data.data;
                    setHowto(data.attributes.content);
                }
                return response;
            })
            .catch((error) => {
                throw error;
            });
    }, [i18next.language]);

    return {
        model: {
            downloadDataButtonText,
            downloadGraphButtonText,
            searchButtonText,
            filterButtonText,
            heading,
            evaluationsData,
            selectionConfig,
            selectedFilters,
            loading,
            howto,
        },
        operations: {
            showDivision,
            fetchData,
        },
    };
};

export { useEvaluationPageComponent };
