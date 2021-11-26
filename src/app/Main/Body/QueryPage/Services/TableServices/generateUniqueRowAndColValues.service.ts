import _ from "lodash";
import { ClientIsolateCountedGroups } from "../../../../../Shared/Model/Client_Isolate.model";

export function generateUniqueRowAndColValuesService(
    allValuesTitle: string,
    isolateCountGroups: ClientIsolateCountedGroups,
    colAttribute: string,
    rowAttribute: string
): [string[], string[]] {
    const isolateColValues: string[] = [allValuesTitle];
    const isolateRowValues: string[] = [allValuesTitle];
    isolateCountGroups.forEach((isolateCount) => {
        isolateColValues.push(isolateCount[colAttribute]);
        isolateRowValues.push(isolateCount[rowAttribute]);
    });
    const uniqIsolateColValues = _.uniq(isolateColValues);
    const uniqIsolateRowValues = _.uniq(isolateRowValues);

    return [uniqIsolateColValues, uniqIsolateRowValues];
}
