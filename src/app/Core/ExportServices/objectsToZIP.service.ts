import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FilterInterface } from "../../Shared/Filter.model";
import { ExportInterface, MainFilterLabelInterface } from "../../Shared/Export.model";
import { generateParameterHeader } from "./generateParameterHeader.service";
import { statDataStringGenerator } from "./generateStatString.service";
import { RAWDataStringGenerator } from "./generateRAWString.service";

interface ObjectToCsvBothProps {
    setting: ExportInterface;
    filter: FilterInterface;
    ZNFilename: string;
    allFilterLabel: string;
    mainFilterLabels: MainFilterLabelInterface;
    mainFilterAttributes: string[];
}

export function objectToZIP(props: ObjectToCsvBothProps): void {
    const csvRows: string[] = [];
    const csvRowsRAW: string[] = [];
    const csvRowsStat: string[] = [];

    csvRowsRAW.push(
        generateParameterHeader({
            filter: props.filter,
            allFilterLabel: props.allFilterLabel,
            mainFilterLabels: props.mainFilterLabels,
            mainFilterAttributes: props.mainFilterAttributes
        })
    );
    csvRowsRAW.push(statDataStringGenerator(props.setting));
    csvRows.push(csvRowsRAW.join("\n"));

    csvRowsStat.push(
        generateParameterHeader({
            filter: props.filter,
            allFilterLabel: props.allFilterLabel,
            mainFilterLabels: props.mainFilterLabels,
            mainFilterAttributes: props.mainFilterAttributes
        })
    );
    csvRowsStat.push(
        RAWDataStringGenerator(
            props.setting.rawDataSet.rawKeys,
            props.setting.rawDataSet.rawData
        )
    );
    csvRows.push(csvRowsStat.join("\n"));

    const subNames = ["Statistic-Data", "RAW-Data"];
    const zip = new JSZip();
    csvRows.forEach((CSV, i): void => {
        zip.file(`${subNames[i]}_${props.ZNFilename}`, CSV);
    });

    const folderName: string = props.ZNFilename.replace(".csv", ".zip");

    zip.generateAsync({ type: "blob", comment: folderName })
        .then((content) => {
            saveAs(content, folderName);
            return true;
        })
        .catch(() => {
            return false;
        });
}
