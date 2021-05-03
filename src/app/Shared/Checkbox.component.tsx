/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Checkbox, FormControlLabel } from "@material-ui/core";

export interface CheckboxesProps {
    onCheckboxChange: (name: string, checked: boolean) => void;
    checked: boolean;
    name: string;
    label: string;
}

/**
 * @desc Returns checkbox
 * @param props
 * @returns {JSX.Element} - checkbox component
 */
export function CheckboxComponent(props: CheckboxesProps): JSX.Element {
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    const checkboxKey = `checkbox-${props.name}`

    return (
        <FormControlLabel
            control={
                <Checkbox
                    checked={props.checked}
                    onChange={(event) =>
                        handleChangeCheckbox(
                            event.target.name,
                            event.target.checked
                        )
                    }
                    name={props.name}
                    color="primary"
                    key={checkboxKey}
                />
            }
            label={props.label}
        />
    );
}
