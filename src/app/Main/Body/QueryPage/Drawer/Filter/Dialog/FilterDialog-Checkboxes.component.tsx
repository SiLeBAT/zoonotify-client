import React from "react";
import { FormGroup } from "@material-ui/core";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { CheckboxComponent } from "../../../../../../Shared/Checkbox.component";

function filterCheckboxes(
    mainFilters: string[],
    displayedFilter: string[],
    handleChangeCheckbox: (name: string, checked: boolean) => void,
    t: TFunction
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
                label={t(`Filters.${mainFilter}`)}
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
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeCheckbox = (name: string, checked: boolean): void => {
        props.onHandleChangeCheckbox(name, checked);
    };

    return (
        <FormGroup>
            {filterCheckboxes(
                props.mainFilters,
                props.filterToDisplay,
                handleChangeCheckbox, 
                t
            )}
        </FormGroup>
    );
}
