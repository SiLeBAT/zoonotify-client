import {
    FilterInterface,
    mainFilterAttributes,
} from "../../Shared/Filter.model";

interface ParameterHeaderProps {
    filter: FilterInterface;
    allFilterLabel: string;
    mainFilterLabels: { Erreger: string; Matrix: string; Projektname: string };
}

export function generateParameterHeader(props: ParameterHeaderProps): string {
    const HeaderRows: string[] = [];
    HeaderRows.push("\uFEFF");
    HeaderRows.push("####################");
    HeaderRows.push("#####Parameter:");

    mainFilterAttributes.forEach((element): void => {
        if (props.filter[element].length !== 0) {
            HeaderRows.push(
                `###${props.mainFilterLabels[element]}:"${props.filter[
                    element
                ].join('""')}"`
            );
        } else {
            HeaderRows.push(
                `###${props.mainFilterLabels[element]}:${props.allFilterLabel}`
            );
        }
    });
    HeaderRows.push("####################");

    return HeaderRows.join("\n");
}
