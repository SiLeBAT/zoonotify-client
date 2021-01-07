/**
 * @desc escape all quotes and repalces "undefinded" with an empty string
 * @param {string} inputString - string to be modified
 * @returns {string} - modified string
 */
function stringModification(inputString: string): string {
    return `"${inputString.replace(/"/g, '\\"').replace("undefined", "")}"`;
}

/**
 * @desc Transform the data to a string for the CSV file. Elements of one row are separeted by comma. 
 * @param {Record<string, string>[]} dataArray - data object to export in a csv file
 * @param {k[]} headers - keys of the data
 * @returns {string} - data in one csv string 
 */
export function generateCSVString<
    T extends Record<string, string>,
    K extends keyof T
>(dataArray: T[], headers: K[]): string {
    const csvTable: string[] = [];

    dataArray.forEach((row) => {
        const values: string[] = headers.map((header) => {
            return stringModification(`${row[header]}`);
        });
        csvTable.push(values.join(","));
    });
    const csvTableData: string = csvTable.join("\n");
    return csvTableData;
}
