import { ClientIsolateCountedGroups } from "../../../../../Shared/Model/Client_Isolate.model";
import { generateOneTableRowObjService } from "./generateOneTableRowObj.service";
import { generateUniqueRowAndColValuesService } from "./generateUniqueRowAndColValues.service";

export function generateStatisticTableDataAbsService(
    allValuesText: string,
    isolateCountGroups: ClientIsolateCountedGroups,
    columnNameValues: string[],
    rowNameValues: string[],
    colAttribute: string,
    rowAttribute: string
): Record<string, string>[] {
    /* const rowNameValues = generateTableHeaderValuesService(
        isRow,
        allValuesText,
        uniqueValues,
        selectedFilters,
        rowAttribute
    ); */

    const [uniqIsolateColValues, uniqIsolateRowValues] =
        generateUniqueRowAndColValuesService(
            allValuesText,
            isolateCountGroups,
            colAttribute,
            rowAttribute
        );

    const statisticTableDataAbs: Record<string, string>[] = [];

    rowNameValues.forEach((rowName) => {
        const tempStatTable: Record<string, string> =
            generateOneTableRowObjService(
                rowName,
                columnNameValues,
                uniqIsolateColValues,
                uniqIsolateRowValues,
                isolateCountGroups,
                rowAttribute,
                colAttribute,
                allValuesText
            );
        statisticTableDataAbs.push(tempStatTable);
    });

    return statisticTableDataAbs;
}
