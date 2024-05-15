import {
    Checkbox,
    FormControl,
    InputLabel,
    ListItemIcon,
    ListItemText,
    MenuItem,
} from "@mui/material";
// eslint-disable-next-line import/named
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React from "react";
import { useTranslation } from "react-i18next";
import { SelectionItem } from "../model/Evaluations.model";
import { useStyles } from "./../utils/utils";

type FilterMultiSelectionComponentProps = {
    selectedItems: string[];
    selectionOptions: SelectionItem[];
    name: string;
    label: string;
    actions: {
        handleChange: (event: SelectChangeEvent<string[]>) => void;
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
        selectedItems.length === selectionOptions.length;

    const handleChange = (event: SelectChangeEvent<string[]>): void => {
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
                value={selectedItems}
                label={label}
                onChange={handleChange}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 500,
                            width: "300px",
                            overflowX: "hidden",
                        },
                    },
                }}
                renderValue={(selected) => selected.map((s) => t(s)).join(", ")}
            >
                <MenuItem value="all">
                    <ListItemIcon>
                        <Checkbox
                            checked={isAllSelected}
                            indeterminate={
                                selectedItems.length > 0 &&
                                selectedItems.length < selectionOptions.length
                            }
                        />
                    </ListItemIcon>
                    <ListItemText primary={t("Select_All")} />
                </MenuItem>
                {selectionOptions.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                        <Checkbox
                            checked={selectedItems.includes(item.value)}
                        />
                        <ListItemText
                            primary={item.displayName}
                            primaryTypographyProps={{
                                style: { whiteSpace: "normal" },
                            }}
                        />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
