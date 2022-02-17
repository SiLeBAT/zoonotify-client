/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
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
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    const checkboxesList: JSX.Element[] = [];
    props.checkboxes.forEach((checkbox) => {
        const checkboxKey = `checkbox-${checkbox.name}`;

        checkboxesList.push(
            <FormControlLabel
                css={props.size === "small" ? smallToggleStyle : null}
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
                        color="primary"
                    />
                }
                label={checkbox.label}
                key={checkboxKey}
            />
        );
    });
    return <FormGroup>{checkboxesList}</FormGroup>;
}
