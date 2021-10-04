import React from "react";
import { ValueType } from "react-select";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import _ from "lodash";
import { SelectorComponent } from "../../../../../Shared/Selector.component";
import { FeatureType } from "../../../../../Shared/Context/DataContext";
import { FilterType } from "../../../../../Shared/Model/Filter.model";
import { bfrDarkgrey, primaryColor } from "../../../../../Shared/Style/Style-MainTheme.component";

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

    const isNotSelected: boolean = _.isEmpty(props.activeFeature);

    const dropDownValuesObj: {
        value: string;
        label: string;
    }[] = generateTranslatedSelectorObject(offeredAttributes, t);

    const selectedValueObj: {
        value: string;
        label: string;
    } | null = isNotSelected
        ? null
        : {
              value: props.activeFeature,
              label: t(`Filters.${props.activeFeature}`),
          };
    const handleChange = (
        selectedOption: ValueType<{ value: string; label: string }>,
        keyName: FilterType | FeatureType
    ): void => {
        if (
            selectedOption !== undefined &&
            selectedOption !== null &&
            !Array.isArray(selectedOption)
        ) {
            const option = selectedOption as { value: string; label: string };
            if (option.value !== props.activeFeature) {
                props.onChange(
                    selectedOption as { value: string; label: string },
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
            titleColor={bfrDarkgrey}
            hooverColor={primaryColor}
            hooverColorDark={bfrDarkgrey}
            noOptionLabel={t("Drawer.Selector")}
            dropDownValuesObj={dropDownValuesObj}
            selectedValuesObj={
                selectedValueObj === null ? [] : [selectedValueObj]
            }
            selectAttribute={props.selectAttribute}
            onChange={handleChange}
            isMulti={false}
            isNotSelected={isNotSelected}
            isDisabled={props.dataIsLoading}
            hide={false}
        />
    );
}
