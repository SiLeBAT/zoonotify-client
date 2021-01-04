import { MainFilterLabelInterface } from "../../Shared/Model/Export.model";
import {
    FilterInterface,
    mainFilterAttributes,
} from "../../Shared/Model/Filter.model";

interface ParameterHeaderProps {
    filter: FilterInterface;
    allFilterLabel: string;
    mainFilterLabels: MainFilterLabelInterface;
}

export function generateParameterHeader(props: ParameterHeaderProps): string {
    const HeaderRows: string[] = [];
    HeaderRows.push("\uFEFF");
    HeaderRows.push("#Parameter:");

    mainFilterAttributes.forEach((element): void => {
        if (props.filter[element].length !== 0) {
            const headerFilterArray: string[] = [];
            props.filter[element].forEach((filterValue) => {
                headerFilterArray.push(`"${filterValue}"`);
            });
            const headerFilterString = headerFilterArray.join(";");
            const completeHeaderString = `#${props.mainFilterLabels[element]}: ${headerFilterString}`;
            HeaderRows.push(completeHeaderString);
        } else {
            HeaderRows.push(
                `#${props.mainFilterLabels[element]}: "${props.allFilterLabel}"`
            );
        }
    });
    HeaderRows.push(" ");

    return HeaderRows.join("\n");
}
