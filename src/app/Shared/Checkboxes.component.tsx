/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";

export type CheckboxesObject = {
    name: string;
    label: string;
    checked: boolean;
};

export interface CheckboxesProps {
    onCheckboxChange: (name: string, checked: boolean) => void;
    checkboxes: CheckboxesObject[];
}

/**
 * @desc Returns checkbox
 * @param props
 * @returns {JSX.Element} - checkbox component
 */
export function CheckboxesComponent(props: CheckboxesProps): JSX.Element {
    const handleChangeCheckbox = (name: string, checked: boolean): void =>
        props.onCheckboxChange(name, checked);

    const checkboxesList: JSX.Element[] = [];
    props.checkboxes.forEach((checkbox) => {
        const checkboxKey = `checkbox-${checkbox.name}`;

        checkboxesList.push(
            <FormControlLabel
                control={
                    <Checkbox
                        checked={checkbox.checked}
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
