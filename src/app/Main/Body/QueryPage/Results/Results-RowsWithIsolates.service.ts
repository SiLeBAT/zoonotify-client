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
): string => {
    return (_.filter(data, filterObject).length as unknown) as string;
};

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

export function generateRowsWithIsolates(
    data: DBentry[],
    colAttribute: FilterType,
    rowAttribute: FilterType,
    rowValues: string[],
    colValues: string[],
    check: "both" | "row" | "col"
): Record<string, string>[] {
    const rowsWithIsolates: Record<string, string>[] = [];
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
            const count = countIsolates(data, filterObject);
            isolatesRow[colValue] = count;
        });
        rowsWithIsolates.push(isolatesRow);
    });
    return rowsWithIsolates;
}
