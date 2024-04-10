import React from "react";
import { Checkbox, ListItemText, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

interface SelectAllComponentProps {
    allSelected: boolean;
    handleSelectAll: (isSelected: boolean) => void;
    optionsLength: number;
}

export const SelectAllComponent: React.FC<SelectAllComponentProps> = ({
    allSelected,
    handleSelectAll,
    optionsLength,
}) => {
    const { t } = useTranslation(["PrevalencePage"]);

    return (
        <MenuItem value="all" onClick={() => handleSelectAll(!allSelected)}>
            <Checkbox
                checked={allSelected}
                indeterminate={allSelected && optionsLength > 0}
            />
            <ListItemText primary={t("SELECT_ALL")} />
        </MenuItem>
    );
};
