import { FilterInterface } from "../../Shared/Model/Filter.model";
import {
    ExportInterface,
    MainFilterLabelInterface,
} from "../../Shared/Model/Export.model";
import { generateParameterHeader } from "./generateParameterHeader.service";
import { generateStatisticString } from "./StatExportServices/generateStatisticString.service";
import { DbKeyCollection } from "../../Shared/Model/Client_Isolate.model";
import { generateDataString } from "./DataExportServices/generateDataString.service";

export interface ObjectToCsvParameter {
    setting: ExportInterface;
    filter: FilterInterface;
    allFilterLabel: string;
    mainFilterLabels: MainFilterLabelInterface;
    mainFilterAttributes: string[];
}

/**
 * @desc Convert the chosen parameter and the resulting Data to a CSV string
 * @param {ObjectToCsvParameter} csvParameter
 * @returns {string} - converted data as csv string
 */
export function dataOrStatisticToCsvString(
    csvParameter: ObjectToCsvParameter
): string {
    const csvRows: string[] = [];
    csvRows.push(
        generateParameterHeader(
            csvParameter.filter,
            csvParameter.allFilterLabel,
            csvParameter.mainFilterLabels,
            csvParameter.mainFilterAttributes
        )
    );

    if (csvParameter.setting.raw && !csvParameter.setting.stat) {
        csvRows.push(
            generateDataString(
                csvParameter.setting.rawDataSet.rawData,
                DbKeyCollection,
                csvParameter.mainFilterLabels,
                csvParameter.mainFilterAttributes
            )
        );
    }

    if (csvParameter.setting.stat && !csvParameter.setting.raw) {
        csvRows.push(
            generateStatisticString(
                csvParameter.setting.tableAttributes,
                csvParameter.setting.statDataSet
            )
        );
    }

    return csvRows.join("\n");
}
