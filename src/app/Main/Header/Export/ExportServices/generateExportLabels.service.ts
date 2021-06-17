import { useTranslation } from "react-i18next";
import { getCurrentDate } from "../../../../Core/getCurrentDate.service";
import { FilterType } from "../../../../Shared/Model/Filter.model";

export interface ExportLabels {
    ZNFilename: string;
    mainFilterLabels: Record<FilterType, string>;
    allFilterLabel: string;
}

/**
 * @desc Returns all labels for the file export in the right language
 * @param mainFilterAttributes - list of the main filters
 * @returns { ExportLabels } - object of labels: for the file, of the main filters, for "all values"
 */
export function generateExportLabels(
    mainFilterAttributes: string[]
): ExportLabels {
    const { t } = useTranslation(["QueryPage"]);

    const ZNFilename = `ZooNotify_${getCurrentDate()}.csv`;

    const mainFilterLabels = {} as Record<FilterType, string>;
    mainFilterAttributes.forEach((mainFilter) => {
        mainFilterLabels[mainFilter] = t(`Filters.${mainFilter}`);
    });

    const allFilterLabel: string = t("Filters.All");

    return { ZNFilename, mainFilterLabels, allFilterLabel };
}
