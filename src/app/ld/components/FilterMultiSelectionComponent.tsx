import {
    Checkbox,
    FormControl,
    InputLabel,
    ListItemIcon,
    ListItemText,
    MenuItem,
} from "@mui/material";
// eslint-disable-next-line import/named
import Select from "@mui/material/Select";
import React from "react";
import { useTranslation } from "react-i18next";
import { SelectionItem } from "../model/LinkedData.model";
import { useStyles } from "./../utils/utils";

type FilterMultiSelectionComponentProps = {
    selectedItems: string[];
    selectionOptions: SelectionItem[];
    name: string;
    label: string;
    actions: {
        handleChange: (event: { target: { value: string } }) => void;
    };
};

export function FilterMultiSelectionComponent({
    selectedItems,
    selectionOptions,
    label,
    name,
    actions,
}: FilterMultiSelectionComponentProps): JSX.Element {
    const { t } = useTranslation(["ExplanationPage"]);
    const classes = useStyles();
    const isAllSelected =
        selectionOptions.length > 0 &&
        selectedItems.length == selectionOptions.length;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (event: { target: { value: any } }): void => {
        const value = event.target.value;
        const index = value.indexOf("all");
        const selectedItemIndex = selectedItems.indexOf("all");
        if (index !== -1 && selectedItemIndex == -1) {
            if (selectedItems.length == 0) {
                event.target.value = selectionOptions.map((a) => a.value);
                selectedItems = selectionOptions.map((a) => a.value);
            } else {
                event.target.value = [];
                selectedItems = [];
            }
        }
        actions.handleChange(event);
    };
    return (
        <FormControl className={classes.formControl} sx={{ flex: "1 1 0" }}>
            <InputLabel id="select-label">{label}</InputLabel>
            <Select
                labelId="select-label"
                id="select"
                name={name}
                multiple
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                value={selectedItems}
                label={label}
                renderValue={(selection) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const translated = selection.map((s) => t(s));
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return translated.join(", ");
                }}
                onChange={handleChange}
            >
                <MenuItem
                    value="all"
                    classes={{
                        root: isAllSelected ? classes.selectedAll : "",
                    }}
                >
                    <ListItemIcon>
                        <Checkbox
                            classes={{
                                indeterminate: classes.indeterminateColor,
                            }}
                            checked={isAllSelected}
                            indeterminate={
                                selectedItems.length > 0 &&
                                selectedItems.length < selectionOptions.length
                            }
                        />
                    </ListItemIcon>
                    <ListItemText
                        classes={{ primary: classes.selectAllText }}
                        primary={t("Select_All")}
                    />
                </MenuItem>
                {selectionOptions.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                        <Checkbox
                            checked={selectedItems.indexOf(item.value) > -1}
                        />
                        <ListItemText primary={item.displayName} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
