/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { ValueType } from "react-select";
import {
    FilterInterface,
    FilterType,
} from "../../../../../Shared/Model/Filter.model";
import {
    bfrDarkgrey,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";
import { SelectorComponent } from "../../../../../Shared/Selector.component";
import { CheckIfSingleFilterIsSet } from "../../Services/checkIfFilterIsSet.service";
import { generateSelectorObject } from "./generateSelectorObject.service";
import { FeatureType } from "../../../../../Shared/Context/DataContext";

const subFilterSelectorStyle = css`
    display: grid;
    grid-template-columns: 1fr 2fr;
`;

const subFilterTargetLabelStyle = css`
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
    subFilterTarget: string;
    subFilterValues: string[];
    selectedFilter: FilterInterface;
    subFilterAttribute: FilterType;
    onChange: (
        selectedOption: { value: string; label: string }[] | null,
        keyName: FilterType | FeatureType
    ) => void;
    noOptionLabel: string;
}

/**
 * @desc Returns one selector for subfilter.
 * @param props
 * @returns {JSX.Element} - selector component
 */
export function SubFilterSelectorComponent(props: SelectorProps): JSX.Element {
    const selectedSubFilterValues: string[] =
        props.selectedFilter[props.subFilterAttribute];
    const selectedSubValuesObj = generateSelectorObject(
        props.subFilterAttribute,
        selectedSubFilterValues,
    );
    const noFilter: boolean = CheckIfSingleFilterIsSet(
        props.selectedFilter,
        props.subFilterAttribute
    );
    const dropDownValuesObj = generateSelectorObject(
        props.subFilterAttribute,
        props.subFilterValues,
    );

    const handleChange = (
        selectedOption: ValueType<{ value: string; label: string }, boolean>,
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

    return (
        <div
            css={subFilterSelectorStyle}
            key={`subFilter-selector-component-${props.subFilterAttribute}`}
        >
            <p css={subFilterTargetLabelStyle}>{props.subFilterTarget}</p>
            <SelectorComponent
                key={`subFilter-selector-${props.subFilterAttribute}`}
                mainColor={primaryColor}
                titleColor={primaryColor}
                hooverColor={bfrDarkgrey}
                hooverColorDark={bfrDarkgrey}
                label={props.subFilterAttribute}
                noOptionLabel={props.noOptionLabel}
                dropDownValuesObj={dropDownValuesObj}
                selectedValuesObj={selectedSubValuesObj}
                selectAttribute={props.subFilterAttribute}
                onChange={handleChange}
                isMulti
                isNotSelected={noFilter}
                isDisabled={props.dataIsLoading}
                hide={false}
            />
        </div>
    );
}
