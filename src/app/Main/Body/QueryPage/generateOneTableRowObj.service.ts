import _ from "lodash";
import { ClientIsolateCountedGroups } from "../../../Shared/Model/Client_Isolate.model";

export function generateOneTableRowObjService(
    rowElement: string,
    colValues: string[],
    uniqIsolateColValues: string[],
    uniqIsolateRowValues: string[],
    isolateCountGroups: ClientIsolateCountedGroups,
    rowAttribute: string,
    colAttribute: string,
    allValuesText: string
): Record<string, string> {
    const tempStatTable: Record<string, string> = {};
    tempStatTable.name = rowElement;
    colValues.forEach((colElement: string | number) => {
        if (
            _.includes(uniqIsolateColValues, colElement) &&
            _.includes(uniqIsolateRowValues, rowElement)
        ) {
            isolateCountGroups.forEach((isolateGroup) => {
                if (
                    (isolateGroup[rowAttribute] === rowElement ||
                        isolateGroup[rowAttribute] === undefined) &&
                    (isolateGroup[colAttribute] === colElement ||
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
            tempStatTable[colElement] = "0";
        }
    });
    
    return tempStatTable;
}
