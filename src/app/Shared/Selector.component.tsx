/** @jsx jsx */
import { css, jsx, keyframes, SerializedStyles } from "@emotion/core";
import Select, { ValueType, StylesConfig } from "react-select";
import { InputLabel } from "@material-ui/core";
import { FilterType } from "./Model/Filter.model";
import { TableType } from "./Context/TableContext";
import { primaryColor, bfrDarkgrey } from "./Style/Style-MainTheme.component";

const selectAreaStyle = css`
    margin: 0.25em 1em 1em 16px;
`;
const openText = keyframes`
      0%   {color:white; left:0px; top:20px;}
    100% {left:0px; top:0px;}
`;
const closeText = keyframes`
    0% {left:0px; top:0px;}
    100%   {color:white; left:0px; top:20px;}
`;
const labelStyle = (noSelect: boolean): SerializedStyles => css`
    position: relative;
    animation-name: ${noSelect ? closeText : openText};
    animation-duration: 0.25s;
    animation-delay: 0s;
    color: ${noSelect ? "white" : bfrDarkgrey};
    font-size: 0.75rem;
    margin-left: 16px;
    margin-top: 1em;
`;

const selectStyle: StylesConfig = {
    control: (styles) => ({
        ...styles,
        backgroundColor: "white",
        borderRadius: "0px",
        borderTop: "0 !important",
        borderLeft: "0 !important",
        borderRight: "0 !important",
        boxShadow: "0 !important",
        ":hover": {
            borderBottom: `1.5px solid ${primaryColor}`,
        },
    }),

    multiValue: (styles) => {
        return {
            ...styles,
            borderRadius: "25px",
            padding: "0.25em",
        };
    },

    multiValueRemove: (styles) => ({
        ...styles,
        ":hover": {
            backgroundColor: bfrDarkgrey,
            color: "white",
            borderRadius: "25px",
        },
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        ":hover": {
            color: primaryColor,
        },
    }),

    clearIndicator: (styles) => ({
        ...styles,
        ":hover": {
            color: primaryColor,
        },
    }),
};

export interface SelectorProps {
    label: string;
    dropDownValuesObj: { value: string; label: string }[];
    selectedValuesObj: { value: string; label: string }[];
    noOptionLabel: string;
    selectAttribute: FilterType | TableType;
    onChange: (
        selectedOption: {value: string, label: string} | ValueType<{value: string, label: string}>,
        keyName: FilterType | TableType
    ) => void;
    isMulti: boolean;
    isNotSelect: boolean;
}

/**
 * @desc Returns one selector for filter or row/column.
 * @param {string} label - label for the selector
 * @param {{value: string, label: string}[]} dropDownValuesObj - all possible values for the selector with labels
 * @param {{value: string, label: string}[]} selectedValuesObj - values that are already selected in other selectors with labels
 * @param {FilterType | TableType} selectAttribute - attribute for the selector
 * @param {(selectedOption: ValueType<{value: string, label: string}>,keyName: FilterType | TableType) => void} handleChange - function to handle change of the selector
 * @param {boolean} isMulti - true if the user can select multiple values
 * @param {boolean} isNotSelect - true if no selector is selected so far
 * @returns {JSX.Element} - selector component
 */
export function SelectorComponent(props: SelectorProps): JSX.Element {
    const handleChange = (
        selectedOption: ValueType<{
            value: string;
            label: string;
        }>,
        keyName: FilterType | TableType
    ): void => props.onChange(selectedOption, keyName);

    return (
        <div>
            <InputLabel
                css={labelStyle(props.isNotSelect)}
                id={`label${props.label}`}
            >
                {props.label}
            </InputLabel>
            <Select
                css={selectAreaStyle}
                closeMenuOnSelect={false}
                isMulti={props.isMulti}
                noOptionsMessage={() => props.noOptionLabel}
                options={props.dropDownValuesObj}
                placeholder={props.label}
                onChange={(selectedOption) =>
                    handleChange(selectedOption, props.selectAttribute)
                }
                styles={selectStyle}
                value={props.selectedValuesObj}
                theme={(theme) => ({
                    ...theme,
                    colors: {
                        ...theme.colors,
                        primary: primaryColor,
                    },
                })}
                isClearable
            />
        </div>
    );
}
