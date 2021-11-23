import { TFunction } from "i18next";
import { FilterType } from "../../../../../Shared/Model/Filter.model";

export interface ExportLabels {
    mainFilterLabels: Record<FilterType, string>;
    allFilterLabel: string;
}

/**
 * @desc Returns all labels for the file export in the right language
 * @param mainFilterAttributes - list of the main filters
 * @returns { ExportLabels } - object of labels: for the file, of the main filters, for "all values"
 */
export function generateExportLabels(
    mainFilterAttributes: string[],
    t: TFunction
): ExportLabels {

    const mainFilterLabels = {} as Record<FilterType, string>;
    mainFilterAttributes.forEach((mainFilter) => {
        mainFilterLabels[mainFilter] = t(`QueryPage:Filters.${mainFilter}`);
    });

    const allFilterLabel: string = t("QueryPage:Filters.All");

    return { mainFilterLabels, allFilterLabel };
}
