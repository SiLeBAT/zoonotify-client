import {
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
} from "@mui/material";
// eslint-disable-next-line import/named
import Select from "@mui/material/Select";
import React from "react";
import { useTranslation } from "react-i18next";
import { SelectionItem } from "../model/Evaluations.model";

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
    return (
        <FormControl sx={{ flex: "1 1 0" }}>
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
                renderValue={(selected) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const translated = selected.map((s) => t(s));
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return translated.join(", ");
                }}
                onChange={actions.handleChange}
            >
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
