import { FilterInterface } from "../Shared/Filter.model";
import { ExportInterface } from "../Shared/Export.model";
import { generateParameterHeader } from "./ExportServices/generateParameterHeader.service";
import { RAWDataStringGenerator } from "./ExportServices/generateRAWString.service";
import { statDataStringGenerator } from "./ExportServices/generateStatString.service";

interface ObjectToCsvProps {
    setting: ExportInterface;
    filter: FilterInterface;
    allFilterLabel: string;
    mainFilterLabels: { Erreger: string; Matrix: string; Projektname: string };
}

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
        csvRows.push(statDataStringGenerator(props.setting));
    }

    return csvRows.join("\n");
}
