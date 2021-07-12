import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import {
    CheckboxesComponent,
    CheckboxesConfig,
} from "../../../../../../Shared/Checkboxes.component";

function generateCheckboxObjectList(
    availableFilters: string[],
    displayedFilters: string[],
    t: TFunction
): CheckboxesConfig[] {
    const checkboxes: CheckboxesConfig[] = [];
    availableFilters.forEach((availableFilter) => {
        const isChecked: boolean = _.includes(
            displayedFilters,
            availableFilter
        );
        const filterLabel: string = t(`Filters.${availableFilter}`);
        checkboxes.push({
            name: availableFilter,
            label: filterLabel,
            checked: isChecked,
        });
    });
    return checkboxes;
}

export function FilterDialogCheckboxesComponent(props: {
    availableFilters: string[];
    filtersToDisplay: string[];
    onFiltersToDisplayChange: (name: string, checked: boolean) => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleChangeFiltersToDisplay = (
        name: string,
        checked: boolean
    ): void => {
        props.onFiltersToDisplayChange(name, checked);
    };

    const checkboxObjectList = generateCheckboxObjectList(
        props.availableFilters,
        props.filtersToDisplay,
        t
    );

    return CheckboxesComponent({
        onCheckboxChange: handleChangeFiltersToDisplay,
        checkboxes: checkboxObjectList,
        size: "default"
    });
}
