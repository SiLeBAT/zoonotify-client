import {
    CMS_API_ENDPOINT,
    CMS_BASE_ENDPOINT,
} from "../../shared/infrastructure/router/routes";
import {
    CMSResponse,
    DataContainer,
    DivisionToken,
    Evaluation,
    EvaluationAttributesDTO,
    FilterSelection,
    SelectionFilterConfig,
    SelectionItem,
} from "./../model/Evaluations.model";
// eslint-disable-next-line import/named
import { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { UseCase } from "../../shared/model/UseCases";

type EvaluationPageModel = {
    downloadButtonText: string;
    heading: string;
    evaluationsData: Evaluation;
    selectionConfig: SelectionFilterConfig[];
};
type EvaluationPageOperations = {
    showDivision: (division: string) => boolean;
};

type EvaluationPageTranslations = {
    downloadButtonText: string;
    heading: string;
};

const microorganism = [
    "E_COLI",
    "CAMPYLOBACTER_SPP",
    "ESBL_AmpC_E_COLI",
    "LISTERIS_MONOCYTOGENES",
    "MRSA",
    "SALMONELLA_SPP",
    "STEC",
    "CARBA_E_COLI",
    "ENTEROCOCCUS_SPP",
];
const category = ["HUHN", "PUTE", "SCHWEIN", "RIND"];
const diagramType = [
    "AGG_TABELLE",
    "ERREGERCHARAK",
    "SUBSTANZ_GRAPH",
    "TREND_DIAGRAMM",
];
const productionType = [
    "HUHN",
    "LEGEHENNEN",
    "MASTHAENCHEN",
    "MASTKALB_JUNGRIND",
    "MASTPUTEN",
    "MASTSCHWEIN",
    "PUTE",
    "RIND",
    "ZUCHTHUEHNER_LEGE_UND_MASTLINIE",
];
const matrix = [
    "ALLE",
    "BLINDDARMINHALT",
    "FRISCHES_FLEISCH",
    "HACKFLEISCH",
    "KOT_STAUB",
    "SCHLACHTKOERPER",
    "HALS_HAUT",
];

const otherDetail = ["KEINE", "HPCL_WHO", "HUMANMEDIZIN"];

const division = ["FUTTERMITTEL", "TIERE", "LEBENSMITTEL"];

const initialFilterSelection: FilterSelection = {
    matrix,
    otherDetail,
    productionType,
    diagramType,
    category,
    microorganism,
    division,
};
function getTranslations(t: TFunction): EvaluationPageTranslations {
    const downloadButtonText = t("Export");
    const heading = t("Heading");
    return { downloadButtonText, heading };
}

function toSelectionItem(stringItems: string[]): SelectionItem[] {
    return stringItems.map((item: string) => ({
        value: item,
        displayName: item,
    }));
}

const useEvaluationPageComponent: UseCase<
    null,
    EvaluationPageModel,
    EvaluationPageOperations
> = () => {
    const { t } = useTranslation(["ExplanationPage"]);

    const emptyDivisions: Evaluation = {
        FUTTERMITTEL: {
            title: t(`FUTTERMITTEL.mainTitle`),
            data: [],
        },
        TIERE: {
            title: t(`TIERE.mainTitle`),
            data: [],
        },
        LEBENSMITTEL: {
            title: t(`LEBENSMITTEL.mainTitle`),
            data: [],
        },
    };

    const [evaluationsData, setEvaluationsData] = useState({
        ...emptyDivisions,
    });

    const availableOptions = {
        matrix: toSelectionItem(matrix),
        otherDetail: toSelectionItem(otherDetail),
        productionType: toSelectionItem(productionType),
        diagramType: toSelectionItem(diagramType),
        category: toSelectionItem(category),
        microorganism: toSelectionItem(microorganism),
        division: toSelectionItem(division),
    };

    const { downloadButtonText, heading } = getTranslations(t);

    const [selectedFilters, setSelectedFilters] = useState(
        initialFilterSelection
    );

    const createQueryString = (selection: FilterSelection): string => {
        const result = Object.entries(selection)
            .map(([key, value]) => {
                return value
                    .map((v) => "filters[" + key + "][$eq]=" + v)
                    .join("&");
            })
            .join("&");
        return result;
    };
    useEffect(() => {
        const qString = createQueryString(selectedFilters);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callApiService<DataContainer<CMSResponse<EvaluationAttributesDTO>[]>>(
            CMS_API_ENDPOINT + "/evaluations?populate=diagram&" + qString
        )
            .then((response) => {
                const result: Evaluation = {
                    ...emptyDivisions,
                };
                if (response.data) {
                    const data = response.data.data;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data.forEach(
                        (entry: CMSResponse<EvaluationAttributesDTO>) => {
                            const divisionToken: DivisionToken = entry
                                .attributes.division as DivisionToken;
                            if (result[divisionToken]) {
                                result[divisionToken].data.push({
                                    ...entry.attributes,
                                    chartPath:
                                        CMS_BASE_ENDPOINT +
                                        entry.attributes.diagram.data[0]
                                            .attributes.url,
                                });
                            }
                        }
                    );
                }
                setEvaluationsData(result);
                return result;
            })
            .catch((error) => {
                throw error;
            });
    }, [selectedFilters]);

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
            label: filter,
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

    return {
        model: {
            downloadButtonText,
            heading,
            evaluationsData,
            selectionConfig,
        },
        operations: {
            showDivision,
        },
    };
};

export { useEvaluationPageComponent };
