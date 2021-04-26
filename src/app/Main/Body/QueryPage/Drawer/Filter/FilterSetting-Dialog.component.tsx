/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState } from "react";
import _ from "lodash";
import {
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormGroup,
} from "@material-ui/core";
import DoneIcon from "@material-ui/icons/Done";
import { Link } from "react-router-dom";
import {
    onPrimaryColor,
    primaryColor,
    secondaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";
import { CheckboxComponent } from "../../../../../Shared/Checkbox.component";

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
const linkStyle = css`
    color: ${primaryColor};
    &:hover {
        color: ${secondaryColor};
    }
`;

function filterCheckboxes(
    mainFilters: string[],
    displayedFilter: string[],
    handleChangeCheckbox: (name: string, checked: boolean) => void
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
                label={mainFilter}
            />
        );
    });
    return checkboxes;
}

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
    }

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

    return (
        <div>
            <Button css={buttonStyle} onClick={handleClickOpen} color="primary">
                Select Filter
            </Button>
            <Dialog
                open={props.isOpen}
                onClose={handleClickCancel}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle>Select Filter</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please select your desired filters. The selected filters
                        will be displayed after clicking the submit button. More
                        information about the filters can be found on the{" "}
                        <Link css={linkStyle} to="/explanations">
                            Explanations
                        </Link>{" "}
                        page.
                    </DialogContentText>
                    <FormGroup
                        css={css`
                            display: flex;
                            flex-direction: row;
                            flex-grow: 1;
                        `}
                    >
                        {filterCheckboxes(
                            props.mainFilters,
                            filterToDisplay,
                            handleChangeCheckbox
                        )}
                    </FormGroup>
                    <div
                        css={css`
                            display: flex;
                            flex-direction: row;
                            justify-content: right;
                        `}
                    >
                        <Button onClick={handleClickCancel} color="primary">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleClickSubmit}
                            color="primary"
                        >
                            <DoneIcon fontSize="small" />
                            Submit
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
