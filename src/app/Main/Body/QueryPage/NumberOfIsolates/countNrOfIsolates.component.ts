import { DBentry } from "../../../../Shared/Isolat.model";

export function countNrOfIsolates(data: DBentry[]): string {
    return (Object.keys(data).length as unknown) as string;
}
