import _ from "lodash";
import { ClientIsolateCountedGroups } from "../../../../../Shared/Model/Client_Isolate.model";

export function generateOneTableRowObjService(
    rowName: string,
    columnNameValues: string[],
    uniqIsolateColValues: string[],
    uniqIsolateRowValues: string[],
    isolateCountGroups: ClientIsolateCountedGroups,
    rowAttribute: string,
    colAttribute: string,
    allValuesText: string
): Record<string, string> {
    const tempStatTable: Record<string, string> = {};
    tempStatTable.name = rowName;
    columnNameValues.forEach((colName: string | number) => {
        if (
            _.includes(uniqIsolateColValues, colName) &&
            _.includes(uniqIsolateRowValues, rowName)
        ) {
            isolateCountGroups.forEach((isolateGroup) => {
                if (
                    (isolateGroup[rowAttribute] === rowName ||
                        isolateGroup[rowAttribute] === undefined) &&
                    (isolateGroup[colAttribute] === colName ||
                        isolateGroup[colAttribute] === undefined)
                ) {
                    const statTableKey =
                        isolateGroup[colAttribute] === undefined
                            ? allValuesText
                            : isolateGroup[colAttribute];
                    tempStatTable[statTableKey] = String(isolateGroup.count);
                }
            });
        } else {
            tempStatTable[colName] = "0";
        }
    });
    
    return tempStatTable;
}
