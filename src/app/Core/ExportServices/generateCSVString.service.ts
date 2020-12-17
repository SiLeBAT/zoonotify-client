function stringModification(inputString: string): string {
    return `"${inputString.replace(/"/g, '\\"').replace("undefined", "")}"`;
}

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
