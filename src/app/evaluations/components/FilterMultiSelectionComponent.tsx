import React from "react";
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
import { useTranslation } from "react-i18next";
import { SelectionItem } from "../model/Evaluations.model";
import { useStyles } from "./../utils/utils";

interface FilterMultiSelectionComponentProps {
    selectedItems: string[];
    selectionOptions: SelectionItem[];
    name: string;
    label: string;
    actions: {
        handleChange: (event: SelectChangeEvent<string[]>) => void;
    };
    extra?: React.ReactNode; // Optional extra content prop
}

export function FilterMultiSelectionComponent({
    selectedItems,
    selectionOptions,
    label,
    name,
    actions,
    extra,
}: FilterMultiSelectionComponentProps): JSX.Element {
    const { t } = useTranslation(["ExplanationPage"]);
    const classes = useStyles();

    const italicWords: string[] = [
        "Salmonella",
        "coli",
        "E.",
        "Bacillus",
        "cereus",
        "monocytogenes",
        "Clostridioides",
        "difficile",
        "Yersinia",
        "Listeria",
        "enterocolitica",
        "Vibrio",
        "Baylisascaris",
        "procyonis",
        "Echinococcus",
        "Campylobacter",
    ];

    const formatMicroorganismName = (
        microName: string | null | undefined
    ): JSX.Element => {
        if (!microName) {
            console.warn("Received null or undefined microorganism name");
            return <></>;
        }
        const words = microName
            .split(/(\s+|-)/)
            .filter((part: string) => part.trim().length > 0);
        return words
            .map((word: string, index: number) => {
                const italic = italicWords.some((italicWord: string) =>
                    word.toLowerCase().includes(italicWord.toLowerCase())
                );
                return italic ? (
                    <i key={index}>{word}</i>
                ) : (
                    <span key={index}>{word}</span>
                );
            })
            .reduce(
                (prev: JSX.Element, curr: JSX.Element) => (
                    <>
                        {prev}
                        {prev ? " " : ""}
                        {curr}
                    </>
                ),
                <></>
            );
    };

    const isAllSelected =
        selectionOptions.length > 0 &&
        selectedItems.length === selectionOptions.length;

    const handleChange = (event: SelectChangeEvent<string[]>): void => {
        const value = event.target.value;

        const index = value.indexOf("all");
        const selectedItemIndex = selectedItems.indexOf("all");
        if (index !== -1 && selectedItemIndex === -1) {
            if (selectedItems.length === 0) {
                event.target.value = selectionOptions.map((a) => a.value);
            } else {
                event.target.value = [];
            }
        }
        actions.handleChange(event);
    };

    return (
        <FormControl
            className={classes.formControl}
            sx={{ flex: "1 1 0", width: "100%" }}
        >
            <InputLabel id="select-label">{label}</InputLabel>
            <Select
                labelId="select-label"
                id="select"
                name={name}
                multiple
                value={selectedItems}
                label={label}
                onChange={handleChange}
                renderValue={(selected) => selected.map((s) => t(s)).join(", ")}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 400,
                            width: 250,
                            overflowX: "hidden",
                        },
                    },
                }}
            >
                <MenuItem value="all">
                    <ListItemIcon>
                        <Checkbox
                            checked={isAllSelected}
                            indeterminate={
                                selectedItems.length > 0 && !isAllSelected
                            }
                        />
                    </ListItemIcon>
                    <ListItemText primary={t("SELECT_ALL")} />
                </MenuItem>
                {selectionOptions.map((item, index) => (
                    <MenuItem key={index} value={item.value}>
                        <Checkbox
                            checked={selectedItems.includes(item.value)}
                        />
                        <ListItemText
                            primary={formatMicroorganismName(item.displayName)}
                            sx={{ whiteSpace: "normal" }} // Add this line to enable text wrapping
                        />
                    </MenuItem>
                ))}
            </Select>
            {extra}
        </FormControl>
    );
}
