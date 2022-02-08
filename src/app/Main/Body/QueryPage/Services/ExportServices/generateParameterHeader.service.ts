import { FilterInterface } from "../../../../../Shared/Model/Filter.model";
import { ExportLabels } from "./generateExportLabels.service";

function generateFilterHeader(
    filterAttributes: string[],
    filters: Record<string, string[]>,
    filterLabels: Record<string, string>,
    allFilterLabel: string
): string[] {
    const filterHeader: string[] = [];
    filterAttributes.forEach((filter): void => {
        if (filters[filter] === undefined || filters[filter].length === 0) {
            filterHeader.push(`#${filterLabels[filter]}: "${allFilterLabel}"`);
        } else {
            const headerFilterArray: string[] = [];
            filters[filter].forEach((filterValue) => {
                headerFilterArray.push(`"${filterValue}"`);
            });
            const headerFilterString = headerFilterArray.join(";");
            const completeHeaderString = `#${filterLabels[filter]}: ${headerFilterString}`;
            filterHeader.push(completeHeaderString);
        }
    });
    return filterHeader;
}
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
    filterLabels: ExportLabels,
    mainFilterAttributes: string[],
    subFilterAttributes: string[],
    titles: {
        filterTitle: string;
        subFilterTitle: string;
    }
): string {
    let selectedFilterHeader: string[] = [];
    selectedFilterHeader.push("\uFEFF");
    selectedFilterHeader.push(`#${titles.filterTitle}:`);

    const mainFilterParameterHeader = generateFilterHeader(
        mainFilterAttributes,
        filter.filters,
        filterLabels.mainFilterLabels,
        filterLabels.allFilterLabel
    );
    selectedFilterHeader = selectedFilterHeader.concat(
        mainFilterParameterHeader
    );

    selectedFilterHeader.push(`#${titles.subFilterTitle}:`);
    const subFilterParameterHeader = generateFilterHeader(
        subFilterAttributes,
        filter.subfilters,
        filterLabels.subFilterLabels,
        filterLabels.allFilterLabel
    );
    selectedFilterHeader = selectedFilterHeader.concat(
        subFilterParameterHeader
    );

    selectedFilterHeader.push(" ");

    const selectedFilterHeaderString = selectedFilterHeader.join("\n");

    return selectedFilterHeaderString;
}
