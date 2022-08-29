import React from "react";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useTheme } from "@mui/system";
import { smallToggleStyle } from "./Style/SmallToggleStyle";

export type CheckboxesConfig = {
    name: string;
    label: string;
    checked: boolean;
    disabled?: boolean;
};

export interface CheckboxesProps {
    onCheckboxChange: (name: string, checked: boolean) => void;
    checkboxes: CheckboxesConfig[];
    size: "small" | "default";
}

/**
 * @desc Returns multiple checkboxes in a FromGroup Element
 * @param props
 * @returns {JSX.Element} - checkboxes component
 */
export function CheckboxesComponent(props: CheckboxesProps): JSX.Element {
    const theme = useTheme();
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    const checkboxesList: JSX.Element[] = [];
    for (const checkbox of props.checkboxes) {
        const checkboxKey = `checkbox-${checkbox.name}`;

        checkboxesList.push(
            <FormControlLabel
                sx={props.size === "small" ? smallToggleStyle : null}
                control={
                    <Checkbox
                        checked={checkbox.checked}
                        disabled={checkbox.disabled}
                        onChange={(event) =>
                            handleChangeCheckbox(
                                event.target.name,
                                event.target.checked
                            )
                        }
                        name={checkbox.name}
                        sx={{
                            color: theme.palette.primary.main,
                            "&.Mui-checked": {
                                color: theme.palette.primary.main,
                            },
                        }}
                    />
                }
                label={checkbox.label}
                key={checkboxKey}
            />
        );
    }
    return <FormGroup>{checkboxesList}</FormGroup>;
}
