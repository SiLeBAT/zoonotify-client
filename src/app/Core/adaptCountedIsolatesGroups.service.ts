import _ from "lodash";

/**
 * @desc Transform the sampling year inside the pairs of counted isolates into a string
 * @param {IsolateCountedDTO} countedIsolatesProp - obj with pairs of counted isolates
 * @returns {ClientIsolateCounted} - obj with pairs of counted isolates
 */
export function adaptCountedIsolatesGroupsService(
    countedIsolatesGroups: (Record<string, string | Date> & {
        count: number;
    })[]
): (Record<string, string> & { count: number })[] {
    const adaptedGroups: (Record<string, string> & {
        count: number;
    })[] = [];

    countedIsolatesGroups.forEach((element) => {
        if (element.samplingYear !== undefined) {
            const adaptedGroup = _.cloneDeep(element);
            adaptedGroup.samplingYear = String(adaptedGroup.samplingYear);
            adaptedGroups.push(
                adaptedGroup as Record<string, string> & {
                    count: number;
                }
            );
        } else {
            adaptedGroups.push(
                element as Record<string, string> & {
                    count: number;
                }
            );
        }
    });

    return adaptedGroups;
}
