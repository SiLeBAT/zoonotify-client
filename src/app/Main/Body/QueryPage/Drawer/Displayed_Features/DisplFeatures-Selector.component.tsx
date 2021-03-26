import React from "react";
import { ValueType } from "react-select";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import _ from "lodash";
import { SelectorComponent } from "../../../../../Shared/Selector.component";
import { TableType } from "../../../../../Shared/Context/TableContext";
import { FilterType } from "../../../../../Shared/Model/Filter.model";
import { generateFeatureList } from "../../../../../Core/generateFeatureList.service";

function generateTranslatedSelectorObject(
    selectorArray: string[],
    translateFunction: TFunction
): { value: string; label: string }[] {
    return selectorArray.map((selectorElement: string) => {
        const label: string = translateFunction(`Filters.${selectorElement}`);
        return { value: selectorElement, label };
    });
}
export interface FeatureSelectorProps {
    /**
     * feature of the corresponding selector (row/colum)
     */
    activeFeature: FilterType;
    /**
     * feature of the other selector (row/column)
     */
    otherFeature: FilterType;
    /**
     * label for the selector in the right language
     */
    label: string;
    /**
     * "row" or "column"
     */
    selectAttribute: FilterType | TableType;
    /**
     * all possible main filter
     */
    mainFilterAttributes: string[];
    onChange: (
        selectedOption: { value: string; label: string },
        keyName: FilterType | TableType
    ) => void;
}

/**
 * @desc Selector to select the displayed features in row/column
 * @param {FeatureSelectorProps} props 
 * @returns {JSX.Element} - selector component
 */
export function DisplayedFeatureSelectorComponent(
    props: FeatureSelectorProps
): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const offeredAttributes: string[] = _.difference(
        props.mainFilterAttributes,
        [props.otherFeature]
    );
    const [isNotSelect, selectedValues]: [
        boolean,
        FilterType[]
    ] = generateFeatureList(props.activeFeature);

    const dropDownValuesObj: {
        value: string;
        label: string;
    }[] = generateTranslatedSelectorObject(offeredAttributes, t);
    const selectedValuesObj: {
        value: string;
        label: string;
    }[] = generateTranslatedSelectorObject(selectedValues, t);

    const handleChange = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | TableType
    ): void => props.onChange(selectedOption as { value: string; label: string }, keyName);

    return (
        <SelectorComponent
            label={props.label}
            noOptionLabel={t("Drawer.Selector")}
            dropDownValuesObj={dropDownValuesObj}
            selectedValuesObj={selectedValuesObj}
            selectAttribute={props.selectAttribute}
            onChange={handleChange}
            isMulti={false}
            isNotSelect={isNotSelect}
        />
    );
}
