/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState } from "react";
import _ from "lodash";
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
    previousFiltersToDisplay: string[];
    availableFilters: string[];
    onSubmitFiltersToDisplay: (newFiltersToDisplay: string[]) => void;
    onCancelFiltersToDisplay: () => void;
}): JSX.Element {
    const [newFiltersToDisplay, setTempFiltersToDisplay] = useState<string[]>(
        props.previousFiltersToDisplay
    );
    const { t } = useTranslation(["QueryPage"]);

    const handleSubmitFiltersToDisplay = (): void => {
        props.onSubmitFiltersToDisplay(newFiltersToDisplay)
    };
    const handleSelectAllFiltersToDisplay = (): void => {
        setTempFiltersToDisplay(props.availableFilters);
    };
    const handleDeselectAllFiltersToDisplay = (): void => {
        setTempFiltersToDisplay([]);
    };

    const handleCancelFiltersToDisplay = (): void => {
        props.onCancelFiltersToDisplay()
        setTempFiltersToDisplay(props.previousFiltersToDisplay);
    };

    const handleChangeFiltersToDisplay = (
        name: string,
        checked: boolean
    ): void => {
        const newFilterToDisplay: string[] = _.cloneDeep(newFiltersToDisplay);
        if (checked) {
            newFilterToDisplay.push(name);
        } else {
            const index = newFilterToDisplay.indexOf(name);
            if (index > -1) {
                newFilterToDisplay.splice(index, 1);
            }
        }
        setTempFiltersToDisplay(newFilterToDisplay);
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
                filtersToDisplay={newFiltersToDisplay}
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
        loading: false,
        dialogTitle: filterDialogTitle,
        dialogContentText: filterContentText,
        dialogContent: filterDialogContent,
        cancelButton: cancelFilterToDisplayButton,
        submitButton: submitFilterToDisplayButton,
        disableSubmitButton: false,
        onClose: handleCancelFiltersToDisplay,
        onSubmitClick: handleSubmitFiltersToDisplay,
    });
}
