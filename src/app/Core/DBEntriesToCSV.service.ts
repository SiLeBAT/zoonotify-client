import { DBentry, DBtype } from "../Shared/Isolat.model";
import { FilterInterface, mainFilterAttributes } from "../Shared/Filter.model";

interface ObjectToCsvProps {
    data: DBentry[];
    keyValues: DBtype[];
    filter: FilterInterface;
    allFilterLabel: string;
    mainFilterLabels: { Erreger: string; Matrix: string; Projektname: string};
}

export function objectToCsv(props: ObjectToCsvProps): string {
    const csvRows: string[] = [];

    csvRows.push("\uFEFF");
    csvRows.push("####################");
    csvRows.push("#####Parameter:");

    mainFilterAttributes.forEach((element): void => {
        if (props.filter[element].length !== 0) {
            csvRows.push(`###${props.mainFilterLabels[element]}:"${props.filter[element].join('""')}"`);
        } else {
            csvRows.push(`###${props.mainFilterLabels[element]}:${props.allFilterLabel}`);
        }
    });
    csvRows.push("####################");

    const headers: DBtype[] = props.keyValues;
    csvRows.push(headers.join(","));

    props.data.forEach((row: DBentry) => {
        const values: string[] = headers.map((header: DBtype) => {
            const escaped: string = `${row[header]}`
                .replace(/"/g, '\\"')
                .replace("undefined", "");
            return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
    });
    const csvData: string = csvRows.join("\n");

    return csvData;
}