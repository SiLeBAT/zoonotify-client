import React from "react";
import { Autocomplete, Box, styled, TextField } from "@mui/material";
import { useTheme } from "@mui/system";
import { FilterType } from "./Model/Filter.model";
import { FeatureType } from "./Context/DataContext";
import { SelectorValue } from "./Model/Selector.model";

export interface SelectorProps {
    subFilter?: boolean;
    /**
     * label for the selector
     */
    label: string;
    /**
     * all possible values for the selector with labels
     */
    dropDownValuesObj: { value: string; label: string }[];
    /**
     * values that are already selected in other selectors with labels
     */
    selectedValuesObj: { value: string; label: string }[];
    /**
     * label if no option is available
     */
    noOptionLabel: string;
    /**
     * attribute for the selector
     */
    selectAttribute: FilterType | FeatureType;
    onChange: (
        selectedOption: SelectorValue,
        keyName: FilterType | FeatureType
    ) => void;
    /**
     * true if the user can select multiple values
     */
    isMulti: boolean;
    isDisabled: boolean;
    hide: boolean;
}

/**
 * @desc Returns one selector for filter or row/column.
 * @param props
 * @returns {JSX.Element} - selector component
 */
export function SelectorComponent(props: SelectorProps): JSX.Element {
    const theme = useTheme();
    /* const [inputValue, setInputValue] = useState(""); */

    const StyledTextField = styled(TextField)({
        "& label.Mui-focused": {
            color: theme.palette.primary.main,
        },
        "& .MuiInput-underline:after": {
            borderBottomColor: theme.palette.primary.main,
        },
        "& .MuiInput-underline:before": {
            borderBottomColor: props.subFilter
                ? theme.palette.primary.main
                : theme.palette.secondary.main,
        },
        "& .MuiInput-underline:disabled": {
            borderBottomColor: "red",
        },
    });
    const handleChange = (
        selectedOption: SelectorValue,
        keyName: FilterType | FeatureType
    ): void => props.onChange(selectedOption, keyName);

    const valueObj: SelectorValue = props.selectedValuesObj;

    let selector: JSX.Element = (
        <Autocomplete
            multiple
            id="tags-standard"
            options={props.dropDownValuesObj}
            getOptionLabel={(option) => option.label}
            noOptionsText={props.noOptionLabel}
            onChange={(_event, value) =>
                handleChange(value, props.selectAttribute)
            }
            filterSelectedOptions
            value={valueObj}
            isOptionEqualToValue={(option, value) =>
                option.value === value.value
            }
            sx={{ margin: "0.25em 1em 0.25em 16px" }}
            ListboxProps={{ style: { maxHeight: "7rem" } }}
            disabled={props.isDisabled}
            renderInput={(params) => (
                <StyledTextField
                    {...params}
                    variant="standard"
                    label={props.label}
                />
            )}
        />
    );

    if (!props.isMulti) {
        const singleValueObj =
            props.selectedValuesObj[0] !== undefined
                ? props.selectedValuesObj[0]
                : null;

        selector = (
            <Autocomplete
                id="tags-standard"
                options={props.dropDownValuesObj}
                noOptionsText={props.noOptionLabel}
                onChange={(_event, value) =>
                    handleChange(value, props.selectAttribute)
                }
                filterSelectedOptions
                value={singleValueObj}
                isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                }
                sx={{ margin: "0.25em 1em 0.25em 16px" }}
                ListboxProps={{ style: { maxHeight: "7rem" } }}
                disabled={props.isDisabled}
                renderInput={(params) => (
                    <StyledTextField
                        {...params}
                        variant="standard"
                        label={props.label}
                    />
                )}
            />
        );
    }

    return (
        <Box sx={{ display: `${props.hide ? "none" : "grid"}` }}>
            {selector}
        </Box>
    );
}
