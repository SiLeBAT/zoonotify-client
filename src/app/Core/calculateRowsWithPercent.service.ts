function getSumOfIsolates(objList: Record<string, string>[]): number {
    let sum = 0;
    objList.forEach((obj) => {
        const k = Object.keys(obj);
        k.forEach((element) => {
            if (element !== "name") {
                sum += (obj[element] as unknown) as number;
            }
        });
    });
    return sum;
}

function calculatePercent(part: number, total: number): string {
    const percent = (part / total) * 100;
    const percentRounded = percent.toFixed(2);
    return percentRounded;
}
/**
 * @desc Calculate the percentage of an objectList with absolute numbers
 * @param {Record<string, string>[]} objList - objectList with one object for every table row with absolute numbers
 * @returns {Record<string, string>[]} - one object for each row inside a list
 */
export function calculateRowsWithPercent(
    objList: Record<string, string>[]
): Record<string, string>[] {
    const rowsWithPercent: Record<string, string>[] = [];
    const sumOfIsolates: number = getSumOfIsolates(objList);
    objList.forEach((obj) => {
        const percentRow: Record<string, string> = { name: obj.name };
        const k = Object.keys(obj);
        k.forEach((element) => {
            if (element !== "name") {
                percentRow[element] = calculatePercent(
                    (obj[element] as unknown) as number,
                    sumOfIsolates
                );
            }
        });
        rowsWithPercent.push(percentRow);
    });
    return rowsWithPercent;
}
