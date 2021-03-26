import { IsolateCountedDTO } from "../../../Shared/Model/Api_Isolate.model";

export async function tableApiService(
    isolateCountUrl: string,
): Promise<{
    isolateCountStatus: number;
    nrOfSelectedIsolates?: number;
    isolateCountGroups?: (Record<string, string | Date> & {
        count: number;
    })[] | undefined
}> {
    const isolateCountResponse: Response = await fetch(isolateCountUrl);
    const isolateCountStatus: number = isolateCountResponse.status
    if (isolateCountStatus === 200) {
        const isolateCountProp: IsolateCountedDTO = await isolateCountResponse.json();
        const nrOfSelectedIsolates = isolateCountProp.totalNumberOfIsolates;
        const isolateCountGroups = isolateCountProp.groups
        return {isolateCountStatus, nrOfSelectedIsolates, isolateCountGroups}
    }
    return {isolateCountStatus}
}
