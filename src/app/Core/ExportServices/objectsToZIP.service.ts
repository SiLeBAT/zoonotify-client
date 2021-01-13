import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FilterInterface } from "../../Shared/Model/Filter.model";
import { ExportInterface, MainFilterLabelInterface } from "../../Shared/Model/Export.model";
import { generateParameterHeader } from "./generateParameterHeader.service";
import { generateStatDataString } from "./generateStatDataString.service";
import { RAWDataStringGenerator } from "./generateRAWString.service";

interface ObjectToZipProps {
    setting: ExportInterface;
    filter: FilterInterface;
    ZNFilename: string;
    allFilterLabel: string;
    mainFilterLabels: MainFilterLabelInterface;
    subFileNames: string[];
}

/**
 * @desc Convert the data table and the statistic table to one ZIP folder
 * @param {ExportInterface} setting -  all info for export (raw/stat, row&column, dataset)
 * @param {FilterInterface} filter - object with the selected filters
 * @param {string} ZNFilename - main filename 
 * @param {string} allFilterLabel - "all values" / "Alle Werte"
 * @param {MainFilterLabelInterface} mainFilterLabels -  object with labels of the main filters 
 * @param {string[]} subFileNames - names of the two different files (data, statistic)
 * @returns {void} 
 */
export function objectToZip(props: ObjectToZipProps): void {
    const csvRows: string[] = [];
    const csvRowsRAW: string[] = [];
    const csvRowsStat: string[] = [];

    csvRowsRAW.push(
        generateParameterHeader({
            filter: props.filter,
            allFilterLabel: props.allFilterLabel,
            mainFilterLabels: props.mainFilterLabels,
        })
    );
    csvRowsRAW.push(generateStatDataString(props.setting));
    csvRows.push(csvRowsRAW.join("\n"));

    csvRowsStat.push(
        generateParameterHeader({
            filter: props.filter,
            allFilterLabel: props.allFilterLabel,
            mainFilterLabels: props.mainFilterLabels,
        })
    );
    csvRowsStat.push(
        RAWDataStringGenerator(
            props.setting.rawDataSet.rawKeys,
            props.setting.rawDataSet.rawData
        )
    );
    csvRows.push(csvRowsStat.join("\n"));

    const zip = new JSZip();
    csvRows.forEach((CSV, i): void => {
        zip.file(`${props.subFileNames[i]}_${props.ZNFilename}`, CSV);
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
