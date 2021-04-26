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
 * @desc Returns the checkboxes to decide which data should be exported.
 * @param props
 * @returns {JSX.Element} - checkboxes component
 */
export function CheckboxComponent(props: CheckboxesProps): JSX.Element {
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

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
                />
            }
            label={props.label}
        />
    );
}
