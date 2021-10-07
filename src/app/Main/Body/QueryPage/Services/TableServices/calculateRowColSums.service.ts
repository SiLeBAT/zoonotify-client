import _ from "lodash";

function chooseNumberFormat(
    calculateRelativeNumber: boolean,
    nrOfIsolates: string | undefined,
    absNrOfIsolates: string | undefined,
    calculatesNumber: number
): string {
    if (calculateRelativeNumber) {
        if (nrOfIsolates === absNrOfIsolates) {
            return "100.0";
        }
        return calculatesNumber.toFixed(1);
    }
    return calculatesNumber.toString();
}

export function calculateRowColSumsAbsolute(
    tableData: Record<string, string>[],
    columnNames: string[],
    isRelativeData: boolean,
    nrOfIsolates: string,
    tableDataAbs?: Record<string, string>[]
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
        const calculateRelativeNumber =
            tableDataAbs !== undefined && isRelativeData;
        let absNrOfIsolates;
        if (tableDataAbs !== undefined) {
            absNrOfIsolates = tableDataAbs[i].rowSum;
        }
        newTableRow.rowSum = chooseNumberFormat(
            calculateRelativeNumber,
            nrOfIsolates,
            absNrOfIsolates,
            rowSum
        );

        tableDataWithSums.push(newTableRow);
    });

    let absColSums: Record<string, string> = {};

    if (tableDataAbs !== undefined) {
        tableDataAbs.forEach((tableDataRow) => {
            if (tableDataRow.name === "colSum") {
                absColSums = tableDataRow;
            }
        });
    }

    const tableDataWithSumsStrings: Record<string, string> = {};
    Object.keys(colSums).forEach((k) => {
        tableDataWithSumsStrings.name = "colSum";
        tableDataWithSumsStrings[k] = chooseNumberFormat(
            isRelativeData,
            nrOfIsolates,
            absColSums[k],
            colSums[k]
        );
    });

    tableDataWithSums.push(tableDataWithSumsStrings);

    return tableDataWithSums;
}
