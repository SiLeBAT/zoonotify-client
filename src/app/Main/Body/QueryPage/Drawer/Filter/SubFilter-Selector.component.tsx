/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { TFunction } from "i18next";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import { SelectorComponent } from "../../../../../Shared/Selector.component";
import { generateSelectorObject } from "./generateSelectorObject.service";
import { FeatureType } from "../../../../../Shared/Context/DataContext";
import { replaceAll } from "../../../../../Core/replaceAll.service";
import { SelectorValue } from "../../../../../Shared/Model/Selector.model";

const subFilterSelectorStyle = css`
    display: grid;
    grid-template-columns: 1fr 2fr;
`;

const subFilterTriggerLabelStyle = css`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 1em;
    margin-bottom: 0.25em;
    font-size: 0.75rem;
    white-space: nowrap;
`;

export interface SelectorProps {
    dataIsLoading: boolean;
    subFilterParent: string;
    subFilterTrigger: string;
    subFilterValues: string[];
    selectedFilter: FilterInterface;
    subFilterAttribute: FilterType;
    onChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ) => void;
    noOptionLabel: string;
    t: TFunction;
}

/**
 * @desc Returns one selector for subfilter.
 * @param props
 * @returns {JSX.Element} - selector component
 */
export function SubFilterSelectorComponent(props: SelectorProps): JSX.Element {
    const { t } = props;
    const subFilterAttributeForTranslation = replaceAll(
        props.subFilterAttribute,
        ".",
        ""
    );
    const selectedSubFilterValues: string[] =
        props.selectedFilter.subfilters[props.subFilterAttribute];
    const selectedSubValuesObj = generateSelectorObject(
        subFilterAttributeForTranslation,
        selectedSubFilterValues,
        t,
        true
    );

    const dropDownValuesObj = generateSelectorObject(
        subFilterAttributeForTranslation,
        props.subFilterValues,
        t,
        true
    );

    const handleChange = (
        selectedOption: SelectorValue,
        keyName: FilterType | FeatureType
    ): void => {
        if (selectedOption !== undefined && Array.isArray(selectedOption)) {
            props.onChange(
                selectedOption as { value: string; label: string }[] | null,
                keyName
            );
        } else {
            props.onChange(null, keyName);
        }
    };

    const subFilterTriggerLabel = t(
        `FilterValues.${props.subFilterParent}.${replaceAll(
            props.subFilterTrigger,
            ".",
            ""
        )}`
    );

    const subFilterName = t(
        `Subfilters.${subFilterAttributeForTranslation}.name`
    );

    return (
        <div
            css={subFilterSelectorStyle}
            key={`subFilter-selector-component-${props.subFilterAttribute}-${props.subFilterTrigger}`}
        >
            <p css={subFilterTriggerLabelStyle}>{subFilterTriggerLabel}</p>
            <SelectorComponent
                key={`subFilter-selector-${props.subFilterAttribute}-${props.subFilterTrigger}`}
                subFilter
                label={subFilterName}
                noOptionLabel={props.noOptionLabel}
                dropDownValuesObj={dropDownValuesObj}
                selectedValuesObj={selectedSubValuesObj}
                selectAttribute={props.subFilterAttribute}
                onChange={handleChange}
                isMulti
                isDisabled={props.dataIsLoading}
                hide={false}
            />
        </div>
    );
}
