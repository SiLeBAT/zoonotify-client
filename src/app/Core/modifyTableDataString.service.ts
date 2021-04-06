/**
 * @desc Escape all quotes and replaces "undefined" with an empty string
 * @desc Include commas by surrounding the string with quotes 
 * @param inputString - string to be modified
 * @returns {string} - modified string
 */
export function modifyTableDataStringService(inputString: string): string {
    return `"${inputString.replace(/"/g, '\\"').replace("undefined", "")}"`;
}
