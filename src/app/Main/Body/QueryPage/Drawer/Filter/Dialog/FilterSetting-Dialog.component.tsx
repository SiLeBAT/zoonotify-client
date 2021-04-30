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
    onClickClose: () => void;
    onSubmitClick: (
        selectedFilters: FilterInterface,
        filterToDisplay: string[]
    ) => void;
}): JSX.Element {
    const [filterToDisplay, setFilterToDisplay] = useState<string[]>(
        props.filterInfo.displayedFilter
    );
    const [newSelectedFilters, setNewSelectedFilters] = useState<FilterInterface>(
        props.filterInfo.selectedFilter
    );
    const { t } = useTranslation(["QueryPage"]);
    const handleClickClose = (): void => props.onClickClose();

    const handleClickCancel = (): void => {
        setFilterToDisplay(props.filterInfo.displayedFilter);
        handleClickClose();
    };

    const handleClickSubmit = (): void => {
        props.onSubmitClick(newSelectedFilters, filterToDisplay);
        handleClickClose();
    };

    const handleChangeCheckbox = (name: string, checked: boolean): void => {
        const newDisplayedFilter: string[] = _.cloneDeep(filterToDisplay);
        if (checked) {
            newDisplayedFilter.push(name);
        } else {
            const index = newDisplayedFilter.indexOf(name);
            if (index > -1) {
                newDisplayedFilter.splice(index, 1);
            }
        }
        const selectedFilters: FilterInterface = _.cloneDeep(props.filterInfo.selectedFilter);;
        props.filterInfo.mainFilter.forEach((mainFilter) => {
            if (!_.includes(newDisplayedFilter, mainFilter)) {
                selectedFilters[mainFilter] = [];
            }
        });
        setNewSelectedFilters(selectedFilters);
        setFilterToDisplay(newDisplayedFilter);
    };

    const handleChangeSelectAll = (): void => {
        setFilterToDisplay(props.filterInfo.mainFilter);
    };
    const handleChangeDeselectAll = (): void => {
        setNewSelectedFilters(defaultFilter.selectedFilter)
        setFilterToDisplay([]);
    };

    const filterDialogTitle = t("FilterDialog.DialogTitle");

    const filterContentText = <FilterDialogContentTextComponent />;
    const filterDialogContent = (
        <div css={filterDialogContentStyle}>
            <FilterDialogCheckboxesComponent
                mainFilters={props.filterInfo.mainFilter}
                filterToDisplay={filterToDisplay}
                onHandleChangeCheckbox={handleChangeCheckbox}
            />
            <FilterDialogSelectAllButtonComponent
                onHandleSelectAll={handleChangeSelectAll}
                onHandleDeselectAll={handleChangeDeselectAll}
            />
        </div>
    );
    const filterDialogButtons = (
        <FilterDialogButtonsComponent
            onHandleCancelClick={handleClickCancel}
            onHandleSubmitClick={handleClickSubmit}
        />
    );

    return (
            
            DialogComponent({
                isOpen: props.isOpen,
                dialogTitle: filterDialogTitle,
                dialogContentText: filterContentText,
                dialogContent: filterDialogContent,
                dialogButtons: filterDialogButtons,
                onClickClose: handleClickCancel,
            })
    );
}
