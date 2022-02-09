import { TFunction } from "i18next";
import { replaceAll } from "../../../../../Core/replaceAll.service";

export function generateSelectorObject(
    filterAttribute: string,
    selectorArray: string[],
    t?: TFunction,
    isSubFilter = false
): { value: string; label: string }[] {
    return selectorArray.map((filterValue) => {
        let filterValueLabel = filterValue;
        if (t !== undefined) {
            if (isSubFilter) {
                const filterValueWithNoDot = replaceAll(filterValue, ".", "-");
                const filterValueToTranslate = replaceAll(
                    filterValueWithNoDot,
                    ":",
                    ""
                );
                filterValueLabel = t(
                    `Subfilters.${filterAttribute}.values.${filterValueToTranslate}`
                );
            } else {
                filterValueLabel = t(
                    `FilterValues.${filterAttribute}.${filterValue.replace(
                        ".",
                        ""
                    )}`
                );
            }
        }
        return { value: filterValue, label: filterValueLabel };
    });
}
