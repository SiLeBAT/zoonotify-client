import React from "react";
import { ValueType } from "react-select";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import _ from "lodash";
import { SelectorComponent } from "../../../../../Shared/Selector.component";
import { FeatureType } from "../../../../../Shared/Context/DataContext";
import { FilterType } from "../../../../../Shared/Model/Filter.model";

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
    dataIsLoading: boolean;
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
    selectAttribute: FilterType | FeatureType;
    /**
     * all possible main filter
     */
    mainFilterAttributes: string[];
    onChange: (
        selectedOption: { value: string; label: string } | null,
        keyName: FilterType | FeatureType
    ) => void;
}

/**
 * @desc Selector to select the displayed features in row/column
 * @param props
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

    const isNotSelect: boolean = _.isEmpty(props.activeFeature);
    const selectedValue: FilterType | null = isNotSelect
        ? null
        : props.activeFeature;

    const dropDownValuesObj: {
        value: string;
        label: string;
    }[] = generateTranslatedSelectorObject(offeredAttributes, t);

    const selectedValueObj:
        | {
              value: string;
              label: string;
          }[]
        | [] =
        selectedValue === null
            ? []
            : [
                  {
                      value: selectedValue,
                      label: t(`Filters.${selectedValue}`),
                  },
              ];

    const handleChange = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | FeatureType
    ): void => {
        if (selectedOption !== undefined && !Array.isArray(selectedOption)) {
            const option = selectedOption as { value: string; label: string };
            if (option.value !== selectedValue) {
                props.onChange(
                    selectedOption as { value: string; label: string } | null,
                    keyName
                );
            }
        } else {
            props.onChange(null, keyName);
        }
    };

    return (
        <SelectorComponent
            label={props.label}
            noOptionLabel={t("Drawer.Selector")}
            dropDownValuesObj={dropDownValuesObj}
            selectedValuesObj={selectedValueObj}
            selectAttribute={props.selectAttribute}
            onChange={handleChange}
            isMulti={false}
            isNotSelect={isNotSelect}
            isDisabled={props.dataIsLoading}
            hide={false}
        />
    );
}
