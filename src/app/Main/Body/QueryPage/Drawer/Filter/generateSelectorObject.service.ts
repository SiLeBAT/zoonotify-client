import { TFunction } from "i18next";
import { replaceAll } from  "../../../../../Core/replaceAll.service";

export function generateSelectorObject(
    filterAttribute: string,
    selectorArray: string[],
    t?: TFunction, 
    isSubFilter?: boolean,
): { value: string; label: string }[] {
    return selectorArray.map((filterValue) => {
        if (t !== undefined) {
            if (isSubFilter) {
                const filterValueLabel = t(
                    `Subfilters.${filterAttribute}.values.${replaceAll(filterValue,
                        ".",
                        "-"
                    )}`
                );
                return { value: filterValue, label: filterValueLabel };
            }
            const filterValueLabel = t(
                `FilterValues.${filterAttribute}.${filterValue.replace(
                    ".",
                    ""
                )}`
            );
            return { value: filterValue, label: filterValueLabel };
        }
        return { value: filterValue, label: filterValue };
    });
}
