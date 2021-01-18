import { FilterInterface } from "../../Shared/Model/Filter.model";
import {
    ExportInterface,
    MainFilterLabelInterface,
} from "../../Shared/Model/Export.model";
import { generateParameterHeader } from "./generateParameterHeader.service";
import { RAWDataStringGenerator } from "./generateRAWString.service";
import { generateStatDataString } from "./generateStatDataString.service";

export interface ObjectToCsvParameter {
    setting: ExportInterface;
    filter: FilterInterface;
    allFilterLabel: string;
    mainFilterLabels: MainFilterLabelInterface;
}

/**
 * @desc Convert the chosen parameter and the resulting Data to a CSV string
 * @param {ExportInterface} setting - all info for export (raw/stat, row&column, dataset)
 * @param {FilterInterface} filter - object with the selected filters
 * @param {string} allFilterLabel - "all values" / "Alle Werte"
 * @param {MainFilterLabelInterface} mainFilterLabels - object with labels of the main filters
 * @returns {string} - converted data as csv string
 */
export function objectToCsv(csvParameter: ObjectToCsvParameter): string {
    const csvRows: string[] = [];
    csvRows.push(
        generateParameterHeader(
            csvParameter.filter,
            csvParameter.allFilterLabel,
            csvParameter.mainFilterLabels
        )
    );

    if (csvParameter.setting.raw && !csvParameter.setting.stat) {
        csvRows.push(
            RAWDataStringGenerator(
                csvParameter.setting.rawDataSet.rawKeys,
                csvParameter.setting.rawDataSet.rawData
            )
        );
    }

    if (csvParameter.setting.stat && !csvParameter.setting.raw) {
        csvRows.push(generateStatDataString(csvParameter.setting));
    }

    return csvRows.join("\n");
}
