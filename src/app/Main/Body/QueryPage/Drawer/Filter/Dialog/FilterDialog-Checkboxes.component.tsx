import React from "react";
import { FormGroup } from "@material-ui/core";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { CheckboxComponent } from "../../../../../../Shared/Checkbox.component";

function filterCheckboxes(
    availableFilters: string[],
    displayedFilters: string[],
    handleChangeFiltersToDisplay: (name: string, checked: boolean) => void,
    t: TFunction
): JSX.Element[] {
    const checkboxes: JSX.Element[] = [];
    availableFilters.forEach((availableFilter) => {
        const isChecked: boolean = _.includes(displayedFilters, availableFilter);
        checkboxes.push(
            <CheckboxComponent
                onCheckboxChange={handleChangeFiltersToDisplay}
                checked={isChecked}
                name={availableFilter}
                label={t(`Filters.${availableFilter}`)}
            />
        );
    });
    return checkboxes;
}

export function FilterDialogCheckboxesComponent(props: {
    availableFilters: string[];
    filtersToDisplay: string[];
    onFiltersToDisplayChange: (name: string, checked: boolean) => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeFiltersToDisplay = (name: string, checked: boolean): void => {
        props.onFiltersToDisplayChange(name, checked);
    };

    return (
        <FormGroup>
            {filterCheckboxes(
                props.availableFilters,
                props.filtersToDisplay,
                handleChangeFiltersToDisplay, 
                t
            )}
        </FormGroup>
    );
}
