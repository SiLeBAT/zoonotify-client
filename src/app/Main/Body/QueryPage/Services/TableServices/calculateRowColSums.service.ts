import _ from "lodash";

function calcSums(
    tableData: Record<string, string>[],
    columnNames: string[],
    mapRowSums: (value: number, index: number) => string,
    mapColSums: (value: number, key: string) => string,
    totalSum: string
): Record<string, string>[] {
    const tableDataWithSums: Record<string, string>[] = [];

    const colSums: Record<string, number> = columnNames.reduce(
        (o, k) => ({ ...o, [k]: 0 }),
        {}
    );

    tableData.forEach((tableRow, i) => {
        const newTableRow = _.cloneDeep(tableRow);

        let rowSum = 0;
        columnNames.forEach((colName) => {
            const number = Number.parseFloat(tableRow[colName]);
            if (number !== undefined) {
                rowSum += number;
                const newColSum = colSums[colName] + number;
                colSums[colName] = newColSum;
            }
        });

        newTableRow.rowSum = mapRowSums(rowSum, i);

        tableDataWithSums.push(newTableRow);
    });

    const rowWithColSums: Record<string, string> = {};
    rowWithColSums.name = "colSum";
    columnNames.forEach((colName) => {
        rowWithColSums[colName] = mapColSums(colSums[colName], colName);
    });

    rowWithColSums.rowSum = totalSum;

    tableDataWithSums.push(rowWithColSums);

    return tableDataWithSums;
}

const mapRowSumsAbs = (value: number): string => value.toString();

const mapColSumsAbs = (value: number): string => value.toString();

export function calculateRowColSumsAbsolute(
    tableData: Record<string, string>[],
    columnNames: string[],
    nrOfIsolates: string
): Record<string, string>[] {
    const tableDataWithSums = calcSums(
        tableData,
        columnNames,
        mapRowSumsAbs,
        mapColSumsAbs,
        nrOfIsolates
    );

    return tableDataWithSums;
}

export function calculateRowColSumsRelative(
    tableData: Record<string, string>[],
    columnNames: string[],
    nrOfIsolates: string,
    tableDataAbs: Record<string, string>[]
): Record<string, string>[] {
    const totalSum = "100.0";
    let absColSums: Record<string, string> = {};

    tableDataAbs.forEach((tableDataRow) => {
        if (tableDataRow.name === "colSum") {
            absColSums = tableDataRow;
        }
    });

    const mapRowSumsRelative = (value: number, index: number): string => {
        const absNrOfIsolates = tableDataAbs[index].rowSum;

        let newRowSum = value.toFixed(1);

        if (nrOfIsolates === absNrOfIsolates) {
            newRowSum = "100.0";
        }

        return newRowSum;
    };

    const mapColSumsRelative = (value: number, key: string): string => {
        if (nrOfIsolates === absColSums[key]) {
            return totalSum;
        }
        return value.toFixed(1);
    };

    const tableDataWithSums = calcSums(
        tableData,
        columnNames,
        mapRowSumsRelative,
        mapColSumsRelative,
        totalSum
    );

    return tableDataWithSums;
}
