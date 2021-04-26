/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { FormGroup } from "@material-ui/core";
import _ from "lodash";
import { CheckboxComponent } from "../../../../../../Shared/Checkbox.component";

const checkboxGroupStyle = css`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
`;

function filterCheckboxes(
    mainFilters: string[],
    displayedFilter: string[],
    handleChangeCheckbox: (name: string, checked: boolean) => void
): JSX.Element[] {
    const checkboxes: JSX.Element[] = [];
    mainFilters.forEach((mainFilter) => {
        const isChecked: boolean = _.includes(displayedFilter, mainFilter);
        checkboxes.push(
            <CheckboxComponent
                onCheckboxChange={handleChangeCheckbox}
                checked={isChecked}
                key={`checkbox-${mainFilter}`}
                name={mainFilter}
                label={mainFilter}
            />
        );
    });
    return checkboxes;
}

export function FilterDialogCheckboxesComponent(props: {
    mainFilters: string[];
    filterToDisplay: string[];
    onHandleChangeCheckbox: (name: string, checked: boolean) => void;
}): JSX.Element {
    const handleChangeCheckbox = (name: string, checked: boolean): void => {
        props.onHandleChangeCheckbox(name, checked);
    };

    return (
        <FormGroup css={checkboxGroupStyle}>
            {filterCheckboxes(
                props.mainFilters,
                props.filterToDisplay,
                handleChangeCheckbox
            )}
        </FormGroup>
    );
}
