import _ from "lodash";
import { DBentry, DBtype } from "../Shared/Isolat.model";
import { FilterInterface, mainFilterAttributes } from "../Shared/Filter.model";
import { ExportInterface } from "../Shared/Export.model";

function stringModification(inputString: string): string {
    return `"${inputString.replace(/"/g, '\\"').replace("undefined", "")}"`;
}

function generateCSVString<
    T extends Record<string, string> | DBentry,
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

interface ObjectToCsvProps {
    setting: ExportInterface;
    filter: FilterInterface;
    allFilterLabel: string;
    mainFilterLabels: { Erreger: string; Matrix: string; Projektname: string };
}

export function objectToCsv(props: ObjectToCsvProps): string {
    const csvRows: string[] = [];

    csvRows.push("\uFEFF");
    csvRows.push("####################");
    csvRows.push("#####Parameter:");

    mainFilterAttributes.forEach((element): void => {
        if (props.filter[element].length !== 0) {
            csvRows.push(
                `###${props.mainFilterLabels[element]}:"${props.filter[
                    element
                ].join('""')}"`
            );
        } else {
            csvRows.push(
                `###${props.mainFilterLabels[element]}:${props.allFilterLabel}`
            );
        }
    });
    csvRows.push("####################");

    if (props.setting.raw && !props.setting.stat) {
        const headers: DBtype[] = props.setting.rawDataSet.rawKeys;
        csvRows.push(headers.join(","));
        csvRows.push(
            generateCSVString(props.setting.rawDataSet.rawData, headers)
        );

        return csvRows.join("\n");
    }

    if (props.setting.stat && !props.setting.raw) {
        if (!_.isEmpty(props.setting.tableAttributes.column)) {
            csvRows.push(`,${props.setting.tableAttributes.column}`);
        }
        const headers: string[] = props.setting.statDataSet.statKeys;
        if (!_.isEmpty(props.setting.tableAttributes.row)) {
            const headerToPrint: string[] = [...headers];
            headerToPrint[0] = props.setting.tableAttributes.row;
            csvRows.push(headerToPrint.join(","));
        } else {
            csvRows.push(headers.join(","));
        }

        csvRows.push(
            generateCSVString(props.setting.statDataSet.statData, headers)
        );

        return csvRows.join("\n");
    }

    return "no data selected";
}
