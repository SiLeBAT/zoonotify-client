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
    columnNameValues.forEach((colName: string) => {
        const isolateGroupIncudesRowAndCol: boolean =
            _.includes(uniqIsolateColValues, colName) &&
            _.includes(uniqIsolateRowValues, rowName);

        if (isolateGroupIncudesRowAndCol) {
            let breakIsolateCountLoop = false;
            isolateCountGroups.forEach((isolateGroup) => {
                if (breakIsolateCountLoop) {
                    return;
                }

                const isolateGroupRowValue = isolateGroup[rowAttribute];
                const isolateGroupColValue = isolateGroup[colAttribute];
                const isolateCount = isolateGroup.count;

                const onlyRowNameIsInIsolateGroup: boolean =
                    isolateGroupRowValue === rowName &&
                    isolateGroupColValue === undefined;
                const colNameIsInIsolateGroup: boolean =
                    isolateGroupColValue === colName &&
                    (isolateGroupRowValue === rowName ||
                        isolateGroupRowValue === undefined);

                if (colNameIsInIsolateGroup) {
                    const statTableKey = isolateGroupColValue;
                    tempStatTable[statTableKey] = String(isolateCount);
                    breakIsolateCountLoop = true;
                } else if (onlyRowNameIsInIsolateGroup) {
                    const statTableKey = allValuesText;
                    tempStatTable[statTableKey] = String(isolateCount);
                    breakIsolateCountLoop = true;
                } else {
                    tempStatTable[colName] = "0";
                }
            });
        } else {
            tempStatTable[colName] = "0";
        }
    });
    return tempStatTable;
}
