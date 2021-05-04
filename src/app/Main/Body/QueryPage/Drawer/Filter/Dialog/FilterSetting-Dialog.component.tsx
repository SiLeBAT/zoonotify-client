/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { DialogComponent } from "../../../../../../Shared/Dialog.component";
import { FilterDialogContentTextComponent } from "./FilterDialog-ContentText.component";
import { FilterDialogCheckboxesComponent } from "./FilterDialog-Checkboxes.component";
import { FilterDialogButtonsComponent } from "./FilterDialog-Buttons.component";
import { FilterDialogSelectAllButtonComponent } from "./FilterDialog-SelectAllButton.component";

const filterDialogContentStyle = css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

export function FilterSettingDialogComponent(props: {
    isOpen: boolean;
    availableFilters: string[];
    tempFiltersToDisplay: string[];
    onSubmitFiltersToDisplay: () => void;
    onSelectAllFiltersToDisplay: () => void;
    onDeselectAllFiltersToDisplay: () => void;
    onFilterToDisplayCancel: () => void;
    onFilterToDisplayChange: (
        name: string,
        checked: boolean
    ) => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleCancelFiltersToDisplay = (): void => {
        props.onFilterToDisplayCancel()
    };

    const handleSubmitFiltersToDisplay = (): void => {
        props.onSubmitFiltersToDisplay();
    };

    const handleChangeFiltersToDisplay = (
        name: string,
        checked: boolean
    ): void => {
        props.onFilterToDisplayChange(name, checked);
    };

    const handleSelectAllFiltersToDisplay = (): void => {
        props.onSelectAllFiltersToDisplay()
    };
    const handleDeselectAllFiltersToDisplay = (): void => {
        props.onDeselectAllFiltersToDisplay();
    };

    const filterDialogTitle = t("FilterDialog.DialogTitle");

    const filterContentText = <FilterDialogContentTextComponent />;
    const filterDialogContent = (
        <div css={filterDialogContentStyle}>
            <FilterDialogCheckboxesComponent
                availableFilters={props.availableFilters}
                filtersToDisplay={props.tempFiltersToDisplay}
                onFiltersToDisplayChange={handleChangeFiltersToDisplay}
            />
            <FilterDialogSelectAllButtonComponent
                onSelectAllFiltersToDisplay={handleSelectAllFiltersToDisplay}
                onDeselectAllFiltersToDisplay={
                    handleDeselectAllFiltersToDisplay
                }
            />
        </div>
    );
    const filterDialogButtons = (
        <FilterDialogButtonsComponent
            onFiltersToDisplayCancel={handleCancelFiltersToDisplay}
            onFiltersToDisplaySubmit={handleSubmitFiltersToDisplay}
        />
    );

    return DialogComponent({
        isOpen: props.isOpen,
        dialogTitle: filterDialogTitle,
        dialogContentText: filterContentText,
        dialogContent: filterDialogContent,
        dialogButtons: filterDialogButtons,
        onClose: handleCancelFiltersToDisplay,
    });
}
