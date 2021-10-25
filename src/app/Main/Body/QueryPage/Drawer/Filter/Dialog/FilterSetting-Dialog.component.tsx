/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState } from "react";
import _ from "lodash";
import DoneIcon from "@material-ui/icons/Done";
import { Checkbox, createStyles, Divider, FormControlLabel, makeStyles } from "@material-ui/core";
import { DialogComponent } from "../../../../../../Shared/Dialog.component";
import {
    primaryColor,
    secondaryColor,
} from "../../../../../../Shared/Style/Style-MainTheme.component";
import { FilterDialogCheckboxesComponent } from "./FilterDialog-Checkboxes.component";

const useStyles = makeStyles(() =>
    createStyles({
        divider: {
            background: primaryColor,
            marginLeft: 0,
            marginRight: 0,
        },
    })
);

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
    previousFiltersToDisplay: string[];
    availableFilters: string[];
    onSubmitFiltersToDisplay: (newFiltersToDisplay: string[]) => void;
    onCancelFiltersToDisplay: () => void;
}): JSX.Element {
    const [newFiltersToDisplay, setNewFiltersToDisplay] = useState<string[]>(
        props.previousFiltersToDisplay
    );
    const { t } = useTranslation(["QueryPage"]);
    const classes = useStyles();

    const handleSubmitFiltersToDisplay = (): void => {
        props.onSubmitFiltersToDisplay(newFiltersToDisplay);
    };
    const handleSelectAllCheckBoxChange = (checked: boolean): void => {
        if (checked) {
            setNewFiltersToDisplay(props.availableFilters);
        } else {
            setNewFiltersToDisplay([]);
        }
    };

    const handleCancelFiltersToDisplay = (): void => {
        props.onCancelFiltersToDisplay();
        setNewFiltersToDisplay(props.previousFiltersToDisplay);
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
        setNewFiltersToDisplay(newFilterToDisplay);
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

    const allChecked = props.availableFilters === newFiltersToDisplay
    const indeterminateChecked = props.availableFilters !== newFiltersToDisplay && !_.isEmpty(newFiltersToDisplay)

    const filterDialogContent = (
        <div>
            <FormControlLabel
                label={t("FilterDialog.SelectAll")}
                control={
                    <Checkbox
                        checked={allChecked}
                        indeterminate={indeterminateChecked}
                        onChange={(event) => handleSelectAllCheckBoxChange(event.target.checked)}
                        color="primary"
                    />
                }
            />
            <Divider variant="middle" className={classes.divider} />
            <FilterDialogCheckboxesComponent
                availableFilters={props.availableFilters}
                filtersToDisplay={newFiltersToDisplay}
                onFiltersToDisplayChange={handleChangeFiltersToDisplay}
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
