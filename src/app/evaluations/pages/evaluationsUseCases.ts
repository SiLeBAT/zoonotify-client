import { callApiService } from "../../shared/infrastructure/api/callApi.service";
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
    SelectionFilterConfig,
    SelectionItem,
} from "./../model/Evaluations.model";
// eslint-disable-next-line import/named
import { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

const otherDetails = ["KEINE", "HPCL_WHO", "HUMANMEDIZIN"];

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
    const availableDivisions: SelectionItem[] = toSelectionItem(
        Object.keys(evaluationsData)
    );
    const availableMicroorganisms: SelectionItem[] =
        toSelectionItem(microorganism);
    const availableCategories: SelectionItem[] = toSelectionItem(category);
    const availableDiagramType: SelectionItem[] = toSelectionItem(diagramType);
    const availableProductionType: SelectionItem[] =
        toSelectionItem(productionType);
    const availableMatrix: SelectionItem[] = toSelectionItem(matrix);
    const availableOtherDetails: SelectionItem[] =
        toSelectionItem(otherDetails);

    const { downloadButtonText, heading } = getTranslations(t);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callApiService<DataContainer<CMSResponse<EvaluationAttributesDTO>[]>>(
            CMS_API_ENDPOINT + "/evaluations?populate=diagram"
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
                            const division: DivisionToken = entry.attributes
                                .division as DivisionToken;
                            if (result[division]) {
                                result[division].data.push({
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
    }, []);

    //Should be Reducer?
    const [selectedDivision, setSelectedDivision] = useState<string[]>([
        ...availableDivisions.map((s) => s.value),
    ]);

    const [selectedMicroorganisms, setSelectedMicroorganisms] = useState<
        string[]
    >([...availableMicroorganisms.map((s) => s.value)]);

    const [selectedCategory, setSelectedCategory] = useState<string[]>([
        ...availableCategories.map((s) => s.value),
    ]);

    const [selectedDiagramType, setSelectedDiagramType] = useState<string[]>([
        ...availableDiagramType.map((s) => s.value),
    ]);

    const [selectedProductionType, setSelectedProductionType] = useState<
        string[]
    >([...availableProductionType.map((s) => s.value)]);

    const [selectedMatrix, setSelectedMatrix] = useState<string[]>([
        ...availableMatrix.map((s) => s.value),
    ]);

    const [selectedOtherDetails, setSelectedOtherDetails] = useState<string[]>([
        ...availableOtherDetails.map((s) => s.value),
    ]);

    const selectionConfig: SelectionFilterConfig[] = [
        {
            label: "Bereich",
            selectedItems: selectedDivision,
            selectionOptions: availableDivisions,
            handleChange: (event: { target: { value: string } }): void => {
                const {
                    target: { value },
                } = event;
                setSelectedDivision(
                    // On autofill we get a stringified value.
                    typeof value === "string" ? value.split(",") : value
                );
            },
        },
        {
            label: "Mikroorganismus",
            selectedItems: selectedMicroorganisms,
            selectionOptions: availableMicroorganisms,
            handleChange: (event: { target: { value: string } }): void => {
                const {
                    target: { value },
                } = event;
                setSelectedMicroorganisms(
                    // On autofill we get a stringified value.
                    typeof value === "string" ? value.split(",") : value
                );
            },
        },
        {
            label: "Tierart/Lebensmittel Oberkategorie",
            selectedItems: selectedCategory,
            selectionOptions: availableCategories,
            handleChange: (event: { target: { value: string } }): void => {
                const {
                    target: { value },
                } = event;
                setSelectedCategory(
                    // On autofill we get a stringified value.
                    typeof value === "string" ? value.split(",") : value
                );
            },
        },
        {
            label: "Diagrammtyp",
            selectedItems: selectedDiagramType,
            selectionOptions: availableDiagramType,
            handleChange: (event: { target: { value: string } }): void => {
                const {
                    target: { value },
                } = event;
                setSelectedDiagramType(
                    // On autofill we get a stringified value.
                    typeof value === "string" ? value.split(",") : value
                );
            },
        },
        {
            label: "Tierart Produktionsrichtung/Lebensmittel",
            selectedItems: selectedProductionType,
            selectionOptions: availableProductionType,
            handleChange: (event: { target: { value: string } }): void => {
                const {
                    target: { value },
                } = event;
                setSelectedProductionType(
                    // On autofill we get a stringified value.
                    typeof value === "string" ? value.split(",") : value
                );
            },
        },
        {
            label: "Matrix",
            selectedItems: selectedMatrix,
            selectionOptions: availableMatrix,
            handleChange: (event: { target: { value: string } }): void => {
                const {
                    target: { value },
                } = event;
                setSelectedMatrix(
                    // On autofill we get a stringified value.
                    typeof value === "string" ? value.split(",") : value
                );
            },
        },
        {
            label: "Weitere Details",
            selectedItems: selectedOtherDetails,
            selectionOptions: availableOtherDetails,
            handleChange: (event: { target: { value: string } }): void => {
                const {
                    target: { value },
                } = event;
                setSelectedOtherDetails(
                    // On autofill we get a stringified value.
                    typeof value === "string" ? value.split(",") : value
                );
            },
        },
    ];

    const showDivision = (division: string): boolean => {
        return selectedDivision.includes(division);
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
