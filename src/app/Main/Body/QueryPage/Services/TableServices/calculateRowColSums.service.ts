import _ from "lodash";

function calcSums(
    tableData: Record<string, string>[],
    columnNames: string[],
    mapRowSums: (value: number, index: number) => string,
    mapColSums: (value: Record<string, number>, key: string) => string
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

    const tableDataWithSumsStrings: Record<string, string> = {};
    Object.keys(colSums).forEach((k) => {
        tableDataWithSumsStrings.name = "colSum";
        tableDataWithSumsStrings[k] = mapColSums(colSums, k);
    });

    tableDataWithSums.push(tableDataWithSumsStrings);

    return tableDataWithSums;
}

const mapAbsRowSums = (value: number): string => {
    const stringValue = value.toString();
    return stringValue;
};

const mapAbsColSums = (value: Record<string, number>, key: string): string => {
    const stringValue = value[key].toString();
    return stringValue;
};

export function calculateRowColSumsAbsolute(
    tableData: Record<string, string>[],
    columnNames: string[]
): Record<string, string>[] {
    const tableDataWithSums = calcSums(
        tableData,
        columnNames,
        mapAbsRowSums,
        mapAbsColSums
    );

    return tableDataWithSums;
}

export function calculateRowColSumsRelative(
    tableData: Record<string, string>[],
    columnNames: string[],
    nrOfIsolates: string,
    tableDataAbs: Record<string, string>[]
): Record<string, string>[] {
    const mapRowSums = (value: number, index: number): string => {
        const absNrOfIsolates = tableDataAbs[index].rowSum;

        let newRowSum = value.toFixed(1);

        if (nrOfIsolates === absNrOfIsolates) {
            newRowSum = "100.0";
        }

        return newRowSum;
    };

    const mapColSums = (value: Record<string, number>, key: string): string => {
        let absColSums: Record<string, string> = {};

        tableDataAbs.forEach((tableDataRow) => {
            if (tableDataRow.name === "colSum") {
                absColSums = tableDataRow;
            }
        });
        if (nrOfIsolates === absColSums[key]) {
            return "100.0";
        }
        return value[key].toFixed(1);
    };

    const tableDataWithSums = calcSums(
        tableData,
        columnNames,
        mapRowSums,
        mapColSums
    );

    return tableDataWithSums;
}
