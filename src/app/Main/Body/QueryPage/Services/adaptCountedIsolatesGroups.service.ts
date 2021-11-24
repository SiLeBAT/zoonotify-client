import _ from "lodash";
import { ClientIsolateCountedGroups } from "../../../../Shared/Model/Client_Isolate.model";

/**
 * @desc Transform the sampling year inside the pairs of counted isolates into a string
 * @param countedIsolatesProp - obj with pairs of counted isolates
 * @returns {ClientIsolateCounted} - obj with pairs of counted isolates
 */
export function adaptCountedIsolatesGroupsService(
    countedIsolatesGroups: (Record<string, string | Date> & {
        count: number;
    })[]
): ClientIsolateCountedGroups {
    const adaptedGroups: (Record<string, string> & {
        count: number;
    })[] = [];

    countedIsolatesGroups.forEach((element) => {
        const adaptedGroup = _.cloneDeep(element);
        if (element.samplingYear !== undefined) {
            adaptedGroup.samplingYear = String(adaptedGroup.samplingYear);
            adaptedGroups.push(
                adaptedGroup as Record<string, string> & {
                    count: number;
                }
            );
        } else {
            adaptedGroups.push(
                adaptedGroup as Record<string, string> & {
                    count: number;
                }
            );
        }
    });

    return adaptedGroups;
}
