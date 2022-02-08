import { TFunction } from "i18next";
import { FilterType } from "../../../../../Shared/Model/Filter.model";
import { replaceAll } from "../../../../../Core/replaceAll.service";

export interface ExportLabels {
    mainFilterLabels: Record<FilterType, string>;
    subFilterLabels: Record<FilterType, string>;
    allFilterLabel: string;
}

/**
 * @desc Returns all labels for the file export in the right language
 * @param mainFilterAttributes - list of the main filters
 * @returns { ExportLabels } - object of labels: for the file, of the main filters, for "all values"
 */
export function generateExportLabels(
    mainFilterAttributes: string[],
    subFilterAttributes: string[],
    t: TFunction
): ExportLabels {
    const mainFilterLabels = {} as Record<FilterType, string>;
    mainFilterAttributes.forEach((mainFilter) => {
        const mainFilterKey = replaceAll(mainFilter, ".", "");
        mainFilterLabels[mainFilter] = t(`QueryPage:Filters.${mainFilterKey}`);
    });
    const subFilterLabels = {} as Record<FilterType, string>;

    subFilterAttributes.forEach((subFilter) => {
        const subFilterKey = replaceAll(subFilter, ".", "");
        subFilterLabels[subFilter] = `${t(
            `QueryPage:Subfilters.${subFilterKey}.name`
        )}_${t(`QueryPage:Subfilters.${subFilterKey}.trigger`)}`;
    });

    const allFilterLabel: string = t("QueryPage:Filters.All");

    return { mainFilterLabels, subFilterLabels, allFilterLabel };
}
