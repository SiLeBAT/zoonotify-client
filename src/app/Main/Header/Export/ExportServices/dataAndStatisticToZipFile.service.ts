import JSZip from "jszip";
import { saveAs } from "file-saver";
import { generateParameterHeader } from "./generateParameterHeader.service";
import { generateStatisticTableCsvString } from "./StatExportServices/generateStatisticTableCsvString.service";
import {
    DbKeyCollection,
    DbCollection,
    DbKey,
} from "../../../../Shared/Model/Client_Isolate.model";
import {
    FilterType,
    FilterInterface,
} from "../../../../Shared/Model/Filter.model";
import { generateDataTableCsvString } from "./DataExportServices/generateDataTableCsvString.service";

export interface DataAndStatisticToZipParameter {
    /**
     * all info for export (filtered/stat, row&column, dataset)
     */
    setting: {
        raw: boolean;
        stat: boolean;
        tableAttributeNames: {
            row: string | undefined;
            column: string | undefined;
        };
    };
    rawDataSet: {
        rawData: DbCollection;
        rawKeys: DbKey[];
    };
    statDataSet: {
        statData: Record<string, string>[];
        statKeys: string[];
    };
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
    mainFilterLabels: Record<FilterType, string>;
    /**
     *  names of the two different files (data, statistic)
     */
    subFileNames: {
        raw: string;
        stat: string;
    };
}

/**
 * @desc Convert the data table and the statistic table to one ZIP folder
 * @param zipParameter
 * @returns {void}
 */
export function dataAndStatisticToZipFile(
    zipParameter: DataAndStatisticToZipParameter
): void {
    const csvRows: string[] = [];
    const csvRowsFilteredData: string[] = [];
    const csvRowsStat: string[] = [];

    const zip = new JSZip();

    const parameterHeader: string = generateParameterHeader(
        zipParameter.filter,
        zipParameter.allFilterLabel,
        zipParameter.mainFilterLabels,
        zipParameter.mainFilterAttributes
    );

    if (zipParameter.setting.raw) {
        csvRowsFilteredData.push(parameterHeader);
        csvRowsFilteredData.push(
            generateDataTableCsvString(
                zipParameter.rawDataSet.rawData,
                DbKeyCollection,
                zipParameter.mainFilterLabels,
                zipParameter.mainFilterAttributes
            )
        );
        csvRows.push(csvRowsFilteredData.join("\n"));
        zip.file(
            `${zipParameter.subFileNames.raw}_${zipParameter.ZNFilename}`,
            csvRowsFilteredData.join("\n")
        );
    }

    if (zipParameter.setting.stat) {
        csvRowsStat.push(parameterHeader);
        csvRowsStat.push(
            generateStatisticTableCsvString(
                zipParameter.setting.tableAttributeNames,
                zipParameter.statDataSet
            )
        );
        csvRows.push(csvRowsStat.join("\n"));
        zip.file(
            `${zipParameter.subFileNames.stat}_${zipParameter.ZNFilename}`,
            csvRowsStat.join("\n")
        );
    }

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
