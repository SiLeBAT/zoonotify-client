import { useTranslation } from "react-i18next";
import { getCurrentDate } from "../../../../Core/getCurrentDate.service";
import { MainFilterLabelInterface } from "../../../../Shared/Model/Export.model";


export interface ExportLabelsInterface {
    ZNFilename: string;
    mainFilterLabels: MainFilterLabelInterface;
    allFilterLabel: string;
}

/**
 * @desc Returns all labels for the file export in the right language
 * @param mainFilterAttributes - list of the main filters
 * @returns { ExportLabels } - object of labels: for the file, of the main filters, for "all values"
 */
export function generateExportLabels(
    mainFilterAttributes: string[]
): ExportLabelsInterface {
    const { t } = useTranslation(["QueryPage"]);

    const ZNFilename = `ZooNotify_${getCurrentDate()}.csv`;

    const mainFilterLabels = {} as MainFilterLabelInterface;
    mainFilterAttributes.forEach((mainFilter) => {
        mainFilterLabels[mainFilter] = t(`Filters.${mainFilter}`);
    });

    const allFilterLabel: string = t("Filters.All");

    return { ZNFilename, mainFilterLabels, allFilterLabel };
}
