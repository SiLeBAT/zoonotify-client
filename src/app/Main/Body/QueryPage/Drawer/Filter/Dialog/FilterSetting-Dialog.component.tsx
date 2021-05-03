/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { DialogComponent } from "../../../../../../Shared/Dialog.component";
import { FilterDialogContentTextComponent } from "./FilterDialog-ContentText.component";
import { FilterDialogCheckboxesComponent } from "./FilterDialog-Checkboxes.component";
import { FilterDialogButtonsComponent } from "./FilterDialog-Buttons.component";
import { FilterDialogSelectAllButtonComponent } from "./FilterDialog-SelectAllButton.component";
import { FilterInterface } from "../../../../../../Shared/Model/Filter.model";
import { defaultFilter, FilterContextInterface } from "../../../../../../Shared/Context/FilterContext";


const filterDialogContentStyle = css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

export function FilterSettingDialogComponent(props: {
    isOpen: boolean;
    filterInfo: FilterContextInterface;
    onClickOpen: () => void;
    onClose: () => void;
    onSubmitFiltersToDisplay: (
        selectedFilters: FilterInterface,
        filtersToDisplay: string[]
    ) => void;
}): JSX.Element {
    const [filtersToDisplay, setFiltersToDisplay] = useState<string[]>(
        props.filterInfo.displayedFilters
    );
    const [newSelectedFilters, setNewSelectedFilters] = useState<FilterInterface>(
        props.filterInfo.selectedFilter
    );
    const { t } = useTranslation(["QueryPage"]);

    const availableFilters  = props.filterInfo.mainFilter

    const handleClose = (): void => props.onClose();

    const handleCancelFiltersToDisplay = (): void => {
        setFiltersToDisplay(props.filterInfo.displayedFilters);
        handleClose();
    };

    const handleSubmitFiltersToDisplay = (): void => {
        props.onSubmitFiltersToDisplay(newSelectedFilters, filtersToDisplay);
        handleClose();
    };

    const handleChangeFiltersToDisplay = (name: string, checked: boolean): void => {
        const newDisplayedFilters: string[] = _.cloneDeep(filtersToDisplay);
        if (checked) {
            newDisplayedFilters.push(name);
        } else {
            const index = newDisplayedFilters.indexOf(name);
            if (index > -1) {
                newDisplayedFilters.splice(index, 1);
            }
        }
        const selectedFilters: FilterInterface = _.cloneDeep(props.filterInfo.selectedFilter);;
        availableFilters.forEach((availableFilter) => {
            if (!_.includes(newDisplayedFilters, availableFilter)) {
                selectedFilters[availableFilter] = [];
            }
        });
        setNewSelectedFilters(selectedFilters);
        setFiltersToDisplay(newDisplayedFilters);
    };

    const handleSelectAllFiltersToDisplay = (): void => {
        setFiltersToDisplay(availableFilters);
    };
    const handleDeselectAllFiltersToDisplay = (): void => {
        setNewSelectedFilters(defaultFilter.selectedFilter)
        setFiltersToDisplay([]);
    };

    const filterDialogTitle = t("FilterDialog.DialogTitle");

    const filterContentText = <FilterDialogContentTextComponent />;
    const filterDialogContent = (
        <div css={filterDialogContentStyle}>
            <FilterDialogCheckboxesComponent
                availableFilters={availableFilters}
                filtersToDisplay={filtersToDisplay}
                onFiltersToDisplayChange={handleChangeFiltersToDisplay}
            />
            <FilterDialogSelectAllButtonComponent
                onSelectAllFiltersToDisplay={handleSelectAllFiltersToDisplay}
                onDeselectAllFiltersToDisplay={handleDeselectAllFiltersToDisplay}
            />
        </div>
    );
    const filterDialogButtons = (
        <FilterDialogButtonsComponent
            onFiltersToDisplayCancel={handleCancelFiltersToDisplay}
            onFiltersToDisplaySubmit={handleSubmitFiltersToDisplay}
        />
    );

    return (
            
            DialogComponent({
                isOpen: props.isOpen,
                dialogTitle: filterDialogTitle,
                dialogContentText: filterContentText,
                dialogContent: filterDialogContent,
                dialogButtons: filterDialogButtons,
                onClose: handleCancelFiltersToDisplay,
            })
    );
}
