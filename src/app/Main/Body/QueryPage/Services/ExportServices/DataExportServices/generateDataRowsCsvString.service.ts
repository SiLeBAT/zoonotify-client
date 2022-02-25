import {
    DbCollection,
    DbKey,
    Resistances,
    resistancesCollection,
} from "../../../../../../Shared/Model/Client_Isolate.model";
import { modifyTableDataStringService } from "../../../../../../Core/modifyTableDataString.service";

/**
 * @desc Transform the data to a string for the CSV file. Elements of one row are separated by comma.
 * @param dataArray - data object to export in a csv file
 * @param headers - keys of the data
 * @returns {string} - data in one csv string
 */
export function generateDataRowsCsvString(
    dataArray: DbCollection,
    headers: DbKey[],
    characteristicHeader: string[]
): string {
    const csvTable: string[] = [];
    dataArray.forEach((row) => {
        let csvRow: string[] = [];

        const resistanceRowArray = new Array(resistancesCollection.length).fill(
            0
        );

        headers.forEach((headerValue) => {
            if (headerValue === "resistance") {
                const testedResistances = Object.keys(row.resistance);
                const notTestedResistances = resistancesCollection.filter(
                    (x) => !testedResistances.includes(x)
                );
                testedResistances.forEach((resistanceKey) => {
                    const key = resistanceKey as Resistances;
                    const resistanceIndex = resistancesCollection.indexOf(key);
                    if (row.resistance[key] === true) {
                        resistanceRowArray[resistanceIndex] = "1";
                    } else if (row.resistance[key] === false) {
                        resistanceRowArray[resistanceIndex] = "0";
                    }
                });
                notTestedResistances.forEach((resistanceKey) => {
                    const key = resistanceKey as Resistances;
                    const resistanceIndex = resistancesCollection.indexOf(key);
                    resistanceRowArray[resistanceIndex] = "-";
                });
                csvRow = csvRow.concat(resistanceRowArray);
            } else if (headerValue === "characteristics") {
                characteristicHeader.forEach((charHeader) => {
                    if (row.characteristics[charHeader] !== undefined) {
                        const rowValue: string =
                            row.characteristics[charHeader];
                        csvRow.push(modifyTableDataStringService(rowValue));
                    } else {
                        csvRow.push("-");
                    }
                });
            } else {
                const rowValue: string = row[headerValue];
                csvRow.push(modifyTableDataStringService(rowValue));
            }
        });
        csvTable.push(csvRow.join(","));
    });
    const csvTableData: string = csvTable.join("\n");
    return csvTableData;
}
