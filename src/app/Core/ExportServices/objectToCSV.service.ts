import { FilterInterface } from "../../Shared/Filter.model";
import { ExportInterface, MainFilterLabelInterface } from "../../Shared/Export.model";
import { generateParameterHeader } from "./generateParameterHeader.service";
import { RAWDataStringGenerator } from "./generateRAWString.service";
import { statDataStringGenerator } from "./generateStatString.service";

interface ObjectToCsvProps {
    setting: ExportInterface;
    filter: FilterInterface;
    allFilterLabel: string;
    mainFilterLabels: MainFilterLabelInterface;
    mainFilterAttributes: string[];
}

export function objectToCsv(props: ObjectToCsvProps): string {
    const csvRows: string[] = [];
    csvRows.push(
        generateParameterHeader({
            filter: props.filter,
            allFilterLabel: props.allFilterLabel,
            mainFilterLabels: props.mainFilterLabels,
            mainFilterAttributes: props.mainFilterAttributes
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
        csvRows.push(statDataStringGenerator(props.setting));
    }

    return csvRows.join("\n");
}
