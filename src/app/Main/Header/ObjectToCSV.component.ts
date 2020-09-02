import { DBentry, DBtype } from "../../Shared/Isolat.model";
import { FilterInterface, FilterType } from "../../Shared/Filter.model";

interface ObjectToCsvProps {
    data: DBentry[];
    keyValues: DBtype[];
    filter: FilterInterface;
    allFilterLabel: string;
    mainFilterLabels: string[];
}

export function objectToCsv(props: ObjectToCsvProps): string {
    const csvRows: string[] = [];

    csvRows.push("\uFEFF");
    csvRows.push("####################");
    csvRows.push("#####Parameter:");

    Object.keys(props.filter).forEach((element, i): void => {
        const e = element as FilterType;
        if (props.filter[e].length !== 0) {
            csvRows.push(
                `###${props.mainFilterLabels[i]}:"${props.filter[e].join('""')}"`
            );
        } else {
            csvRows.push(
                `###${props.mainFilterLabels[i]}:${props.allFilterLabel}`
            );
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
