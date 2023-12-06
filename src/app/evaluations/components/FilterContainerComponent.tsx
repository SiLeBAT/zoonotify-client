import SearchIcon from "@mui/icons-material/Search";
import { Box, Button } from "@mui/material";
import Markdown from "markdown-to-jsx";
import React from "react";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import {
    FilterSelection,
    SelectionFilterConfig,
} from "../model/Evaluations.model";
import { FilterMultiSelectionComponent } from "./FilterMultiSelectionComponent";
import { useTranslation } from "react-i18next";

type FilterContainerComponentProps = {
    selectionConfig: SelectionFilterConfig[];
    searchButtonText: string;
    howToHeading: string;
    howToContent: string;
    handleSearchBtnClick: (filter: FilterSelection) => void;
};

export function FilterContainerComponent({
    selectionConfig,
    searchButtonText,
    howToContent,
    howToHeading,
    handleSearchBtnClick,
}: FilterContainerComponentProps): JSX.Element {
    const { t } = useTranslation();
    const initialFilters: FilterSelection = {
        matrix: [],
        productionType: [],
        diagramType: [],
        category: [],
        microorganism: [],
        division: [],
    };
    const gatherFilters = (): FilterSelection => {
        return selectionConfig.reduce((filters, config) => {
            filters[config.id as keyof FilterSelection] = config.selectedItems;
            return filters;
        }, initialFilters);
    };

    const handleSearch = (): void => {
        const updatedFilters = gatherFilters();
        handleSearchBtnClick(updatedFilters);
    };
    const { i18n } = useTranslation();

    return (
        <Box
            key={i18n.language}
            sx={{ display: "flex", flexDirection: "column" }}
        >
            {selectionConfig.map((config) => (
                <Box
                    key={config.id}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        padding: 1,
                        justifyContent: "space-between",
                        gap: 2,
                    }}
                >
                    <FilterMultiSelectionComponent
                        name={config.id}
                        selectedItems={config.selectedItems}
                        selectionOptions={config.selectionOptions}
                        label={t(config.label)}
                        actions={{
                            handleChange: config.handleChange,
                        }}
                    />
                </Box>
            ))}

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
                    onClick={handleSearch}
                    startIcon={<SearchIcon />}
                    sx={{ margin: "8px" }}
                >
                    {searchButtonText}
                </Button>
            </Box>

            <ZNAccordion
                key="howTo"
                title={howToHeading}
                content={<Markdown>{howToContent}</Markdown>}
                defaultExpanded={false}
                centerContent={false}
            />
        </Box>
    );
}
