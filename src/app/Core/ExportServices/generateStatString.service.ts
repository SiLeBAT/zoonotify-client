import _ from "lodash";
import { ExportInterface } from "../../Shared/Model/Export.model";
import { generateCSVString } from "./generateCSVString.service";

export function statDataStringGenerator(settings: ExportInterface): string {
    const StatDataString: string[] = [];
    if (!_.isEmpty(settings.tableAttributes.column)) {
        StatDataString.push(`,${settings.tableAttributes.column}`);
    }
    const headers: string[] = settings.statDataSet.statKeys;
    if (!_.isEmpty(settings.tableAttributes.row)) {
        const headerToPrint: string[] = [...headers];
        headerToPrint[0] = settings.tableAttributes.row;
        StatDataString.push(headerToPrint.join(","));
    } else {
        StatDataString.push(headers.join(","));
    }

    StatDataString.push(
        generateCSVString(settings.statDataSet.statData, headers)
    );

    return StatDataString.join("\n");
}
