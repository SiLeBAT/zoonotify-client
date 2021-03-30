import { ClientIsolateCountedGroups } from "../../../../../Shared/Model/Client_Isolate.model";
import { FilterInterface } from "../../../../../Shared/Model/Filter.model";
import { generateOneTableRowObjService } from "./generateOneTableRowObj.service";
import { generateTableHeaderValuesService } from "./generateTableHeaderValues.service";
import { generateUniqueRowAndColValuesService } from "./generateUniqueRowAndColValues.service";


export function generateStatisticTableDataAbsService(
    isRow: boolean,
    uniqueValues: FilterInterface,
    selectedFilters: FilterInterface,
    allValuesText: string,
    isolateCountGroups: ClientIsolateCountedGroups,
    colValues: string[],
    colAttribute: string,
    rowAttribute: string
): Record<string, string>[] {
    const rowValues = generateTableHeaderValuesService(
        isRow,
        allValuesText,
        uniqueValues,
        selectedFilters,
        rowAttribute
    );

    const [
        uniqIsolateColValues,
        uniqIsolateRowValues,
    ] = generateUniqueRowAndColValuesService(
        allValuesText,
        isolateCountGroups,
        colAttribute,
        rowAttribute
    );
    const statisticTableDataAbs: Record<string, string>[] = [];

    rowValues.forEach((rowElement) => {
        const tempStatTable: Record<string, string> = generateOneTableRowObjService(
            rowElement,
            colValues,
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
