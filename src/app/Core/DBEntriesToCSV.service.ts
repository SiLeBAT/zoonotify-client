import _ from "lodash";
import { DBentry, DBtype } from "../Shared/Isolat.model";
import { FilterInterface, FilterType, mainFilterAttributes } from "../Shared/Filter.model";


interface ObjectToCsvProps {
    setting: {
        raw: boolean;
        stat: boolean;
        tableAttributes: {
            row: FilterType,
            column: FilterType,
        };
        rawDataSet: {
            rawData: DBentry[];
            rawKeys: DBtype[]; 
        }; 
        statDataSet: {
            statData: Record<string, string>[];
            statKeys:string[];
        };
    }
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

    if (props.setting.raw && !props.setting.stat) {
        const headers: DBtype[] = props.setting.rawDataSet.rawKeys;
        csvRows.push(headers.join(","));
    
        props.setting.rawDataSet.rawData.forEach((row: DBentry) => {
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
    
    if (props.setting.stat && !props.setting.raw) {
        if (!_.isEmpty(props.setting.tableAttributes.column)){
            csvRows.push(`,${props.setting.tableAttributes.column}`);
        }
        const headers: string[] = props.setting.statDataSet.statKeys;
        if (!_.isEmpty(props.setting.tableAttributes.row)){
            const headerToPrint: string[] = [...headers];
            headerToPrint[0] = props.setting.tableAttributes.row; 
            csvRows.push(headerToPrint.join(","));
        } else {
            csvRows.push(headers.join(","));
        }
       
        props.setting.statDataSet.statData.forEach((row: Record<string, string>) => {
            const values: string[] = headers.map((header: string) => {
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
    

    return "no data selected"
   

    
}