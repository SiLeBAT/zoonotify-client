import { FilterInterface } from "../../Shared/Model/Filter.model";
import { ExportInterface, MainFilterLabelInterface } from "../../Shared/Model/Export.model";
import { generateParameterHeader } from "./generateParameterHeader.service";
import { RAWDataStringGenerator } from "./generateRAWString.service";
import { generateStatDataString } from "./generateStatDataString.service";

interface ObjectToCsvProps {
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
export function objectToCsv(props: ObjectToCsvProps): string {
    const csvRows: string[] = [];
    csvRows.push(
        generateParameterHeader({
            filter: props.filter,
            allFilterLabel: props.allFilterLabel,
            mainFilterLabels: props.mainFilterLabels,
        })
    );

    if (props.setting.raw && !props.setting.stat) {
        csvRows.push(
            RAWDataStringGenerator(
                props.setting.rawDataSet.rawKeys,
                props.setting.rawDataSet.rawData
            )
        );
    }

    if (props.setting.stat && !props.setting.raw) {
        csvRows.push(generateStatDataString(props.setting));
    }

    return csvRows.join("\n");
}
