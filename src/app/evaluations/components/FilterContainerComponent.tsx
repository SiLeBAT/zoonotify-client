import { Box, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
// eslint-disable-next-line import/named
import React from "react";
import {
    FilterSelection,
    SelectionFilterConfig,
} from "../model/Evaluations.model";
import { FilterMultiSelectionComponent } from "./FilterMultiSelectionComponent";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterContainerComponentProps = {
    selectionConfig: SelectionFilterConfig[];
    searchButtonText: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleSearchBtnClick: (filter: FilterSelection) => any;
};

export function FilterContainerComponent({
    selectionConfig,
    searchButtonText,
    handleSearchBtnClick,
}: FilterContainerComponentProps): JSX.Element {
    const getFilterById = (id: string): string[] => {
        const result = selectionConfig.filter((config) => {
            return config.id == id;
        });
        if (result && result.length > 0) {
            const selectedItems = result[0].selectedItems;
            if (selectedItems.includes("")) {
                selectedItems.splice(selectedItems.indexOf(""), 1);
            }
            return selectedItems;
        } else return [];
    };

    const handleSearch = (): void => {
        const filter = {
            matrix: getFilterById("matrix"),
            productionType: getFilterById("productionType"),
            diagramType: getFilterById("diagramType"),
            category: getFilterById("category"),
            microorganism: getFilterById("microorganism"),
            division: getFilterById("division"),
        };
        handleSearchBtnClick(filter);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    padding: 1,
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                {selectionConfig.slice(1, 3).map((config) => (
                    <FilterMultiSelectionComponent
                        key={config.label}
                        name={config.id}
                        selectedItems={config.selectedItems}
                        selectionOptions={config.selectionOptions}
                        label={config.label}
                        actions={{
                            handleChange: config.handleChange,
                        }}
                    />
                ))}
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    padding: 1,
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                {selectionConfig.slice(3, 6).map((config) => (
                    <FilterMultiSelectionComponent
                        name={config.id}
                        key={config.label}
                        selectedItems={config.selectedItems}
                        selectionOptions={config.selectionOptions}
                        label={config.label}
                        actions={{
                            handleChange: config.handleChange,
                        }}
                    />
                ))}
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    padding: 1,
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                {selectionConfig.slice(6, 7).map((config) => (
                    <FilterMultiSelectionComponent
                        name={config.id}
                        key={config.label}
                        selectedItems={config.selectedItems}
                        selectionOptions={config.selectionOptions}
                        label={config.label}
                        actions={{
                            handleChange: config.handleChange,
                        }}
                    />
                ))}
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    padding: 1,
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={() => {
                        handleSearch();
                    }}
                    startIcon={<SearchIcon />}
                    sx={{
                        margin: "8px",
                    }}
                >
                    {searchButtonText}
                </Button>
            </Box>
        </Box>
    );
}
