function calculateRelative(part: number, total: number): string {
    const relative = total === 0 ? 0 : (part / total) * 100;
    const relativeRounded = relative.toFixed(2);
    return relativeRounded;
}
/**
 * @desc Calculate the relative numbers of an objectList with absolute numbers
 * @param objList - objectList with one object for every table row with absolute numbers
 * @returns {Record<string, string>[]} - one object for each row inside a list
 */
export function calculateRelativeTableData(
    objList: Record<string, string>[], 
    nrOfSelectedIsolates: number,
): Record<string, string>[] {
    const statisticTableDataRel: Record<string, string>[] = [];
    objList.forEach((obj) => {
        const relativeRow: Record<string, string> = { name: obj.name };
        const k = Object.keys(obj);
        k.forEach((element) => {
            if (element !== "name") {
                relativeRow[element] = calculateRelative(
                    Number.parseInt(obj[element], 10),
                    nrOfSelectedIsolates
                );
            }
        });
        statisticTableDataRel.push(relativeRow);
    });
    return statisticTableDataRel;
}
