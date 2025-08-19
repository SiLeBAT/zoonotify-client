import i18next from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { EVALUATION_INFO } from "../../shared/infrastructure/router/routes";
import {
    FilterSelection,
    SelectionFilterConfig,
    SelectionItem,
} from "../model/Evaluations.model";
import {
    category,
    diagramType,
    division,
    matrix,
    microorganism,
    productionType,
} from "../model/constants";
import { useEvaluationData } from "./EvaluationDataContext";

/** 1) The "flat" interface for single-type "Evaluation Information" */
interface EvaluationInformationItem {
    id: number;
    content: string;
    title?: string;
}

interface EvaluationInformationAPIResponse {
    data: EvaluationInformationItem;
    meta: unknown;
}

/** For building the selection items */
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
    const selectedFilters = evaluationContext.selectedFilters; // <-- read from context

    const [howtoContent, setHowtoContent] = useState("");

    // Build selection items from constants
    const availableOptions: SelectionItemCollection = {
        matrix: toSelectionItem(matrix, t),
        productionType: toSelectionItem(productionType, t),
        diagramType: toSelectionItem(diagramType, t),
        category: toSelectionItem(category, t),
        microorganism: toSelectionItem(microorganism, t),
        division: toSelectionItem(division, t),
    };

    // Handle a change to any filter key by writing back to context
    const handleChange =
        (key: keyof FilterSelection) =>
        (value: string | string[]): void => {
            const newValue = Array.isArray(value) ? value : [value];
            evaluationContext.updateFilters({
                ...selectedFilters,
                [key]: newValue,
            });
        };

    const selectionConfig: SelectionFilterConfig[] = (
        Object.keys(selectedFilters) as (keyof FilterSelection)[]
    ).map((key) => ({
        label: t(key.toUpperCase()),
        id: key as string,
        selectedItems: [...selectedFilters[key]],
        selectionOptions:
            availableOptions[key as keyof SelectionItemCollection],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleChange: (event: any) => {
            const value = event?.target?.value ?? event;
            handleChange(key)(value);
        },
    }));

    // 2) Fetch the single-type "Evaluation Information" in "flat" shape
    useEffect(() => {
        const url = `${EVALUATION_INFO}?locale=${i18next.language}`;
        callApiService<EvaluationInformationAPIResponse>(url)
            .then((response) => {
                if (response.data) {
                    const item = response.data.data;
                    setHowtoContent(item.content);
                }
                return response;
            })
            .catch((error) => {
                console.error("Error fetching 'How To' content", error);
                throw error;
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
