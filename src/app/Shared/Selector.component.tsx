/** @jsx jsx */
import { css, jsx, keyframes, SerializedStyles } from "@emotion/core";
import Select, { ValueType, StylesConfig } from "react-select";
import { InputLabel } from "@material-ui/core";
import { useTranslation } from "react-i18next";
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

/**
 * @desc Transforms a string array to an object. 
 * @param {string[]} selectorArray - array with selector values
 * @returns {Record<string, string>[]} - object with value und label from the string array
 */
function generateSelectorObject(
    selectorArray: string[]
): Record<string, string>[] {
    const selectorObject: Record<string, string>[] = [];
    selectorArray.forEach((element: string) => {
        selectorObject.push({ value: element, label: element });
    });
    return selectorObject;
}

interface SelectorProps {
    label: string;
    selectValues: string[];
    selectAttribute: FilterType | TableType;
    handleChange: (
        selectedOption: ValueType<Record<string, string>>,
        keyName: FilterType | TableType
    ) => void;
    selectedValues: string[];
    isMulti: boolean;
    isNotSelect: boolean;
}

/**
 * @desc Returns one selector for filter or row/column.
 * @param {string} label - label for the selector 
 * @param {string[]} selectValues - all possible values for the selector
 * @param {FilterType | TableType} selectAttribute - attribute for the selector 
 * @param {(selectedOption: ValueType<Record<string, string>>,keyName: FilterType | TableType) => void} handleChange - function to handle change of the selector
 * @param {string[]} selectedValues - values that are already selected in other selectors 
 * @param {boolean} isMulti - true if the user can select multiple values
 * @param {boolean} isNotSelect - true if no selector is selected so far
 * @returns {JSX.Element} - selector component
 */
export function SelectorComponent(props: SelectorProps): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const selectValuesObj: Record<string, string>[] = generateSelectorObject(
        props.selectValues
    );
    const valueObject: Record<string, string>[] = generateSelectorObject(
        props.selectedValues
    );

    const noOptionText = t("Drawer.Selector");

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
                noOptionsMessage={() => noOptionText}
                options={selectValuesObj}
                placeholder={props.label}
                onChange={(selectedOption) =>
                    props.handleChange(selectedOption, props.selectAttribute)
                }
                styles={selectStyle}
                value={valueObject}
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
