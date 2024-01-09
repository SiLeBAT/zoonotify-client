import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Markdown from "markdown-to-jsx";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import {
    FilterSelection,
    SelectionFilterConfig,
} from "../model/Evaluations.model";
import { FilterMultiSelectionComponent } from "./FilterMultiSelectionComponent";

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
    const { t } = useTranslation(["ExplanationPage"]);
    const { i18n } = useTranslation();

    // State to manage the visibility of the tooltip
    const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);

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

    return (
        <Box
            key={i18n.language}
            sx={{ display: "flex", flexDirection: "column" }}
        >

            {selectionConfig.map((config) => {
                const selectedItemsTranslated =
                    config.selectedItems.map((item) => t(item)).join(", ") ||
                    t("None");
                const tooltipTitle = `${t(
                    config.label
                )}: ${selectedItemsTranslated}`;

                return (
                    <Tooltip
                        title={tooltipTitle}
                        key={config.id}
                        open={tooltipOpen === config.id}
                        onClose={() => setTooltipOpen(null)}
                        disableHoverListener={tooltipOpen !== null}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                padding: 1,
                                justifyContent: "space-between",
                                gap: 2,
                            }}
                            onMouseEnter={() => setTooltipOpen(config.id)}
                            onMouseLeave={() => setTooltipOpen(null)}
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
                    </Tooltip>
                );
            })}


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
