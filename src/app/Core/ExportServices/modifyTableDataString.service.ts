/**
 * @desc escape all quotes and replaces "undefined" with an empty string
 * @param {string} inputString - string to be modified
 * @returns {string} - modified string
 */
export function modifyTableDataStringService(inputString: string): string {
    return `"${inputString.replace(/"/g, '\\"').replace("undefined", "")}"`;
}