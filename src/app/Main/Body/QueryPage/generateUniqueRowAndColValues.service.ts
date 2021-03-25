import _ from "lodash";

export function generateUniqueRowAndColValuesService(
    allValuesTitle: string,
    isolateCountGroups: (Record<string, string> & {
        count: number;
    })[],
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
