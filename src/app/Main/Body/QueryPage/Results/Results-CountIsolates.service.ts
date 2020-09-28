import _ from "lodash";
import { FilterType } from "../../../../Shared/Filter.model";
import { DBentry } from "../../../../Shared/Isolat.model";

const selectFilterObject = (
    colAttribute: FilterType,
    rowAttribute: FilterType,
    colValue: string,
    rowValue: string,
    check: string
): { [x: string]: string } => {
    let filterObject = {
        [colAttribute]: colValue,
        [rowAttribute]: rowValue,
    };
    if (check === "col") {
        filterObject = {
            [colAttribute]: colValue,
        };
    } else if (check === "row") {
        filterObject = {
            [rowAttribute]: rowValue,
        };
    }
    return filterObject;
};


const countIsolates = (
    data: DBentry[],
    filterObject: { [x: string]: string }
): number => {
    return _.filter(data, filterObject).length /* as unknown) as string */;
};

// TODO: SUMME aus den countIsolates ist Gesamtzahl
// muss nur noch dargestellt werden, auch wenn nicht 
// die gezählte nummer an isolaten als Table.statisticData setzten
// dann haben alle zugriff
// dann ist nur noch das problem: wann und wie geschieht der aufruf? 
// evtl. doch zwei funktionen? aber das wäre sehr redundant
// aber man braucht immer nur eine der beiden Varianten, es wird nie beides dargestellt - also vielleicht doch okay

/**
 * genaerte a list of objects with an object for each row, with the name of the row and the countet isolates for the corresponding values in the column.
 * @param {DBentry[]} data - A list of DBentries like database.
 * @param {FilterType} colAttribute - selected attribute for the column.
 * @param {FilterType} rowAttribute - selected attribute for the row.
 * @param {string[]} colValues - unique values or the selected filter values of the selected column-attribute
 * @param {string[]} rowValues - unique values or the selected filter values of the selected row-attribute
 * @param {"both" | "row" | "col"} check - decide if only an attriute for the row or column is set, or both
 * @returns {Record<string, string>[]} - one object for each row inside a list
 */

export function getIsolatesRows(
    data: DBentry[],
    colAttribute: FilterType,
    rowAttribute: FilterType,
    rowValues: string[],
    colValues: string[],
    check: "both" | "row" | "col"
): Record<string, string>[] {
    const rowsWithIsolates: Record<string, string>[] = [];
    let sumOfIsolates = 0;
    rowValues.forEach((rowValue) => {
        const isolatesRow: Record<string, string> = { name: rowValue };
        colValues.forEach((colValue) => {
            const filterObject = selectFilterObject(
                colAttribute,
                rowAttribute,
                colValue,
                rowValue,
                check
            );
            const countNumber = countIsolates(data, filterObject);
            const count = (countNumber as unknown) as string;
            sumOfIsolates += countNumber
            isolatesRow[colValue] = count;
        });
        rowsWithIsolates.push(isolatesRow);
    });
    // eslint-disable-next-line no-console
    console.log(sumOfIsolates)
    return rowsWithIsolates;
}
