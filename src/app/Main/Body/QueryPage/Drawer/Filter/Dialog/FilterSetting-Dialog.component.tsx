/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import _ from "lodash";
import { Button } from "@material-ui/core";
import {
    onPrimaryColor,
    primaryColor,
    secondaryColor,
} from "../../../../../../Shared/Style/Style-MainTheme.component";
import { DialogComponent } from "../../../../../../Shared/Dialog.component";
import { FilterDialogContentTextComponent } from "./FilterDialog-ContentText.component";
import { FilterDialogCheckboxesComponent } from "./FilterDialog-Checkboxes.component";
import { FilterDialogButtonsComponent } from "./FilterDialog-Buttons.component";

const buttonStyle = css`
    width: 100%;
    height: 1.5rem;
    margin-top: 0.5em;
    background-color: ${primaryColor};
    color: ${onPrimaryColor};
    &:hover {
        background-color: ${primaryColor};
        color: ${secondaryColor};
    }
`;

export function FilterSettingDialogComponent(props: {
    isOpen: boolean;
    onClickOpen: () => void;
    onClickClose: () => void;
    mainFilters: string[];
    displayedFilter: string[];
    onSubmitClick: (filterToDisplay: string[]) => void;
}): JSX.Element {
    const [filterToDisplay, setFilterToDisplay] = useState<string[]>(
        props.displayedFilter
    );
    const handleClickOpen = (): void => props.onClickOpen();
    const handleClickClose = (): void => props.onClickClose();

    const handleClickCancel = (): void => {
        setFilterToDisplay(props.displayedFilter);
        handleClickClose();
    };

    const handleClickSubmit = (): void => {
        props.onSubmitClick(filterToDisplay);
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
        setFilterToDisplay(newDisplayedFilter);
    };

    const filterContentText = <FilterDialogContentTextComponent />;
    const filterDialogCheckboxes = (
        <FilterDialogCheckboxesComponent
            mainFilters={props.mainFilters}
            filterToDisplay={filterToDisplay}
            onHandleChangeCheckbox={handleChangeCheckbox}
        />
    );
    const filterDialogButtons = (
        <FilterDialogButtonsComponent
            onHandleCancelClick={handleClickCancel}
            onHandleSubmitClick={handleClickSubmit}
        />
    );

    return (
        <div>
            <Button css={buttonStyle} onClick={handleClickOpen} color="primary">
                Select Filter
            </Button>
            {DialogComponent({
                isOpen: props.isOpen,
                dialogTitle: "Select Filter",
                dialogContentText: filterContentText,
                dialogContent: filterDialogCheckboxes,
                dialogButtons: filterDialogButtons,
                onClickClose: handleClickCancel,
            })}
        </div>
    );
}
