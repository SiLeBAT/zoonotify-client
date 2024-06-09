import i18next from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { EVALUATION_INFO } from "../../shared/infrastructure/router/routes";
import { CMSEntity, CMSResponse } from "../../shared/model/CMS.model";
import {
    EvaluationInformationAttributesDTO,
    FilterSelection,
    SelectionFilterConfig,
    SelectionItem,
} from "../model/Evaluations.model";
import {
    category,
    diagramType,
    division,
    initialFilterSelection,
    matrix,
    microorganism,
    productionType,
} from "../model/constants";
import { useEvaluationData } from "./EvaluationDataContext";

interface SelectionItemCollection {
    matrix: SelectionItem[];
    productionType: SelectionItem[];
    diagramType: SelectionItem[];
    category: SelectionItem[];
    microorganism: SelectionItem[];
    division: SelectionItem[];
}
function toSelectionItem(
    stringItems: string[],
    translate: (key: string) => string
): SelectionItem[] {
    return stringItems.map((item) => ({
        value: item,
        displayName: translate(item),
    }));
}

const useEvaluationSideComponent = (): {
    model: {
        selectionConfig: SelectionFilterConfig[];
        howto: string;
        howToHeading: string;
    };
} => {
    const { t } = useTranslation(["ExplanationPage"]);
    const evaluationContext = useEvaluationData();

    const [howtoContent, setHowtoContent] = useState("");

    const [selectedFilters, setSelectedFilters] = useState<FilterSelection>(
        initialFilterSelection
    );

    useEffect(() => {
        evaluationContext.updateFilters(selectedFilters);
    }, [selectedFilters]);

    const handleChange =
        (key: keyof FilterSelection) =>
        (value: string | string[]): void => {
            const newValue = Array.isArray(value) ? value : [value];
            setSelectedFilters((prev: FilterSelection) => {
                return {
                    ...prev,
                    [key]: newValue,
                };
            });
        };

    const availableOptions: SelectionItemCollection = {
        matrix: toSelectionItem(matrix, t),
        productionType: toSelectionItem(productionType, t),
        diagramType: toSelectionItem(diagramType, t),
        category: toSelectionItem(category, t),
        microorganism: toSelectionItem(microorganism, t),
        division: toSelectionItem(division, t),
    };

    const selectionConfig: SelectionFilterConfig[] = Object.keys(
        selectedFilters
    ).map((key) => {
        return {
            label: t(key.toUpperCase()),
            id: key,
            selectedItems: [...selectedFilters[key as keyof FilterSelection]],
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

    return {
        model: {
            selectionConfig,
            howto: howtoContent,
            howToHeading: t("HOW_TO"),
        },
    };
};

export { useEvaluationSideComponent };
