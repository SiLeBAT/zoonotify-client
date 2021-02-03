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
    const selectorLabelObject: {
        value: string;
        label: string;
    }[] = selectorArray.map((selectorElement: string) => {
        const label: string = translateFunction(`Filters.${selectorElement}`);
        return { value: selectorElement, label };
    });
    return selectorLabelObject;
}
export interface FeatureSelectorProps {
    activeFeature: FilterType;
    otherFeature: FilterType;
    label: string;
    selectAttribute: FilterType | TableType;
    mainFilterAttributes: string[];
    handleChange: (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType | TableType
    ) => void;
}

/**
 * @desc Selector to select the displayed features in row/column
 * @param {FilterType} activeFeature - feature of the corresponding selector (row/colum)
 * @param {FilterType} otherFeature - feature of the other selector (row/column)
 * @param {string} label - label for the selector in the right language
 * @param {FilterType | TableType} selectedAttribute - "row" or "column"
 * @param {(selectedOption: ValueType<Record<string, string>>,keyName: FilterType | TableType) => void} handleChange - function to handle the change of the row/colum
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

    return (
        <SelectorComponent
            label={props.label}
            noOptionLabel={t("Drawer.Selector")}
            dropDownValuesObj={dropDownValuesObj}
            selectedValuesObj={selectedValuesObj}
            selectAttribute={props.selectAttribute}
            handleChange={props.handleChange}
            isMulti={false}
            isNotSelect={isNotSelect}
        />
    );
}
