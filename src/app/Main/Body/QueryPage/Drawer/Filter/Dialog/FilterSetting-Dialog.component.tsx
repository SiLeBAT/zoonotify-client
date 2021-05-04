/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import DoneIcon from "@material-ui/icons/Done";
import { DialogComponent } from "../../../../../../Shared/Dialog.component";
import {
    primaryColor,
    secondaryColor,
} from "../../../../../../Shared/Style/Style-MainTheme.component";
import { FilterDialogCheckboxesComponent } from "./FilterDialog-Checkboxes.component";
import { FilterDialogSelectAllButtonComponent } from "./FilterDialog-SelectAllButton.component";

const filterDialogContentStyle = css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const submitButtonStyle = css`
    display: flex;
    align-items: center;
`;
const linkStyle = css`
    color: ${primaryColor};
    &:hover {
        color: ${secondaryColor};
    }
`;

export function FilterSettingDialogComponent(props: {
    isOpen: boolean;
    availableFilters: string[];
    tempFiltersToDisplay: string[];
    onSubmitFiltersToDisplay: () => void;
    onSelectAllFiltersToDisplay: () => void;
    onDeselectAllFiltersToDisplay: () => void;
    onFilterToDisplayCancel: () => void;
    onFilterToDisplayChange: (name: string, checked: boolean) => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleCancelFiltersToDisplay = (): void => {
        props.onFilterToDisplayCancel();
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
        props.onSelectAllFiltersToDisplay();
    };
    const handleDeselectAllFiltersToDisplay = (): void => {
        props.onDeselectAllFiltersToDisplay();
    };

    const filterDialogTitle = t("FilterDialog.DialogTitle");

    const filterContentText = (
        <span>
            {t("FilterDialog.TextContentBeforeLink")}
            <Link css={linkStyle} to="/explanations">
                {t("FilterDialog.LinkText")}
            </Link>
            {t("FilterDialog.TextContentAfterLink")}
        </span>
    );

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

    const submitFilterToDisplayButton = (
        <div css={submitButtonStyle}>
            <DoneIcon fontSize="small" />
            {t("FilterDialog.Submit")}
        </div>
    );
    const cancelFilterToDisplayButton = t("FilterDialog.Cancel");

    return DialogComponent({
        isOpen: props.isOpen,
        dialogTitle: filterDialogTitle,
        dialogContentText: filterContentText,
        dialogContent: filterDialogContent,
        cancelButton: cancelFilterToDisplayButton,
        submitButton: submitFilterToDisplayButton,
        disableSubmitButton: false,
        onClose: handleCancelFiltersToDisplay,
        onCancelClick: handleCancelFiltersToDisplay,
        onSubmitClick: handleSubmitFiltersToDisplay,
    });
}
