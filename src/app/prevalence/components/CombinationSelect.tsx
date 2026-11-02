import React, { useState } from "react";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
} from "@mui/material";
import { useTranslation } from "react-i18next";

/** Menu value of the "select first N / deselect all" row; never a combination. */
const TOGGLE_ALL = "__toggle_all__";

interface CombinationSelectProps {
    availableCombinations: string[];
    selectedCombinations: string[];
    setSelectedCombinations: (combinations: string[]) => void;
    /** Picks beyond this are refused with an explanatory dialog. */
    maxCombinations: number;
}

/**
 * Picks the combinations (sample origin × matrix × sampling stage) compared in
 * the prevalence graph. View-only: it never touches the table or CSV export.
 */
const CombinationSelect: React.FC<CombinationSelectProps> = ({
    availableCombinations,
    selectedCombinations,
    setSelectedCombinations,
    maxCombinations,
}) => {
    const { t } = useTranslation(["PrevalencePage"]);
    const [limitDialogOpen, setLimitDialogOpen] = useState(false);

    // "Select all" can only ever fill the graph up to the cap, so "all selected"
    // is measured against the cap, not the raw number available.
    const maxSelectable = Math.min(
        maxCombinations,
        availableCombinations.length
    );
    const allSelected =
        maxSelectable > 0 && selectedCombinations.length === maxSelectable;
    // Only call it "first four" when the cap actually limits the selection.
    const isCapped = availableCombinations.length > maxCombinations;

    const handleChange = (next: string[]): void => {
        if (next.includes(TOGGLE_ALL)) {
            setSelectedCombinations(
                allSelected ? [] : availableCombinations.slice(0, maxSelectable)
            );
            return;
        }
        if (next.length > maxCombinations) {
            setLimitDialogOpen(true);
            return;
        }
        setSelectedCombinations(next);
    };

    return (
        <>
            <FormControl fullWidth sx={{ mb: 1 }} variant="outlined">
                <InputLabel id="combination-select-label" shrink={true}>
                    {t("Combinations")}
                </InputLabel>
                <Select
                    labelId="combination-select-label"
                    multiple
                    value={selectedCombinations}
                    onChange={(event) =>
                        handleChange(event.target.value as string[])
                    }
                    label={t("Combinations")}
                    sx={{ backgroundColor: "#f5f5f5" }}
                    renderValue={(selected) =>
                        (selected as string[]).join(", ")
                    }
                >
                    <MenuItem value={TOGGLE_ALL}>
                        <Checkbox
                            checked={allSelected}
                            indeterminate={
                                selectedCombinations.length > 0 && !allSelected
                            }
                        />
                        <ListItemText
                            primary={
                                allSelected
                                    ? t("Deselect_All")
                                    : isCapped
                                    ? t("Select_First_Four")
                                    : t("Select_All")
                            }
                        />
                    </MenuItem>
                    {availableCombinations.map((combination) => (
                        <MenuItem key={combination} value={combination}>
                            <Checkbox
                                checked={selectedCombinations.includes(
                                    combination
                                )}
                            />
                            <ListItemText primary={combination} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Dialog
                open={limitDialogOpen}
                onClose={() => setLimitDialogOpen(false)}
                aria-labelledby="combination-limit-title"
            >
                <DialogTitle id="combination-limit-title">
                    {t("Combination_Limit_Title")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t("Combination_Limit_Message")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLimitDialogOpen(false)}>
                        {t("Close")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export { CombinationSelect };
