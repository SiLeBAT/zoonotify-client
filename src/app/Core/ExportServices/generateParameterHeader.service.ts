import { MainFilterLabelInterface } from "../../Shared/Model/Export.model";
import {
    FilterInterface,
    mainFilterAttributes,
} from "../../Shared/Model/Filter.model";

/**
 * @desc Convert the selected filter/parameter to save them as a header in the CSV file
 * @param {FilterInterface} filter - object with the selected filters
 * @param {string} allFilterLabel - "all values" / "Alle Werte"
 * @param {MainFilterLabelInterface} mainFilterLabels - object with labels of the main filters
 * @returns {string} - selected filter/parameter as header string
 */
export function generateParameterHeader(
    filter: FilterInterface,
    allFilterLabel: string,
    mainFilterLabels: MainFilterLabelInterface
): string {
    const HeaderRows: string[] = [];
    HeaderRows.push("\uFEFF");
    HeaderRows.push("#Parameter:");

    mainFilterAttributes.forEach((element: string): void => {
        if (filter[element].length !== 0) {
            const headerFilterArray: string[] = [];
            filter[element].forEach((filterValue: string) => {
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
