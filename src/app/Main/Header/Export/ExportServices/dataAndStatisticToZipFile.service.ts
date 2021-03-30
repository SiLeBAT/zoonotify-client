import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FilterInterface } from "../../../../Shared/Model/Filter.model";
import {
    ExportInterface,
    MainFilterLabelInterface,
} from "../../../../Shared/Model/Export.model";
import { generateParameterHeader } from "./generateParameterHeader.service";
import { generateStatisticTableCsvString } from "./StatExportServices/generateStatisticTableCsvString.service";
import { DbKeyCollection } from "../../../../Shared/Model/Client_Isolate.model";
import { generateDataTableCsvString } from "./DataExportServices/generateDataTableCsvString.service";

export interface DataAndStatisticToZipParameter {
    /**
     * all info for export (filtered/stat, row&column, dataset)
     */
    setting: ExportInterface;
    /**
     * object with the selected filters
     */
    filter: FilterInterface;
    /**
     * list with all main filters
     */
    mainFilterAttributes: string[];
    /**
     * main filename
     */
    ZNFilename: string;
    /**
     * "all values" / "Alle Werte"
     */
    allFilterLabel: string;
    /**
     * object with labels of the main filters
     */
    mainFilterLabels: MainFilterLabelInterface;
    /**
     *  names of the two different files (data, statistic)
     */
    subFileNames: string[];
}

/**
 * @desc Convert the data table and the statistic table to one ZIP folder
 * @param {DataAndStatisticToZipParameter} zipParameter
 * @returns {void}
 */
export function dataAndStatisticToZipFile(
    zipParameter: DataAndStatisticToZipParameter
): void {
    const csvRows: string[] = [];
    const csvRowsFilteredData: string[] = [];
    const csvRowsStat: string[] = [];

    csvRowsFilteredData.push(
        generateParameterHeader(
            zipParameter.filter,
            zipParameter.allFilterLabel,
            zipParameter.mainFilterLabels,
            zipParameter.mainFilterAttributes
        )
    );
    csvRowsFilteredData.push(
        generateStatisticTableCsvString(
            zipParameter.setting.tableAttributes,
            zipParameter.setting.statDataSet
        )
    );
    csvRows.push(csvRowsFilteredData.join("\n"));

    csvRowsStat.push(
        generateParameterHeader(
            zipParameter.filter,
            zipParameter.allFilterLabel,
            zipParameter.mainFilterLabels,
            zipParameter.mainFilterAttributes
        )
    );
    csvRowsStat.push(
        generateDataTableCsvString(
            zipParameter.setting.rawDataSet.rawData,
            DbKeyCollection,
            zipParameter.mainFilterLabels,
            zipParameter.mainFilterAttributes
        )
    );
    csvRows.push(csvRowsStat.join("\n"));

    const zip = new JSZip();
    csvRows.forEach((CSV, i): void => {
        zip.file(
            `${zipParameter.subFileNames[i]}_${zipParameter.ZNFilename}`,
            CSV
        );
    });

    const folderName: string = zipParameter.ZNFilename.replace(".csv", ".zip");

    zip.generateAsync({ type: "blob", comment: folderName })
        .then((content) => {
            saveAs(content, folderName);
            return true;
        })
        .catch(() => {
            return false;
        });
}
