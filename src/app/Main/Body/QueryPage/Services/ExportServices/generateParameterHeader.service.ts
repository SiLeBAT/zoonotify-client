import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";

/**
 * @desc Convert the selected filter/parameter to save them as a header in the CSV file
 * @param filter - object with the selected filters
 * @param allFilterLabel - "all values" / "Alle Werte"
 * @param mainFilterLabels - object with labels of the main filters
 * @param mainFilterAttributes - keys to get matching mainFilterLabel
 * @returns - selected filter/parameter as header string
 */
export function generateParameterHeader(
    filter: FilterInterface,
    allFilterLabel: string,
    mainFilterLabels: Record<FilterType, string>,
    mainFilterAttributes: string[]
): string {
    const HeaderRows: string[] = [];
    HeaderRows.push("\uFEFF");
    HeaderRows.push("#Parameter:");

    mainFilterAttributes.forEach((element): void => {
        if (filter[element].length !== 0) {
            const headerFilterArray: string[] = [];
            filter[element].forEach((filterValue) => {
                headerFilterArray.push(`"${filterValue}"`);
            });
            const headerFilterString = headerFilterArray.join(";");
            const completeHeaderString = `#${mainFilterLabels[element]}: ${headerFilterString}`;
            HeaderRows.push(completeHeaderString);
        } else {
            HeaderRows.push(
                `#${mainFilterLabels[element]}: "${allFilterLabel}"`
            );
        }
    });
    HeaderRows.push(" ");

    return HeaderRows.join("\n");
}
