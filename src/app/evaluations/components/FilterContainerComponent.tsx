import { Box, Tooltip, Button } from "@mui/material";
import Markdown from "markdown-to-jsx";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";
import { SelectionFilterConfig } from "../model/Evaluations.model";
import { FilterMultiSelectionComponent } from "./FilterMultiSelectionComponent";

type FilterContainerComponentProps = {
    selectionConfig: SelectionFilterConfig[];
    howToHeading: string;
    howToContent: string;
};

export function FilterContainerComponent({
    selectionConfig,
    howToContent,
    howToHeading,
}: FilterContainerComponentProps): JSX.Element {
    const { t, i18n } = useTranslation(["ExplanationPage"]);
    const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);

    const handleResetFilters = (): void => {
        selectionConfig.forEach((config) => {
            const event = { target: { value: [] } };
            config.handleChange(event);
        });
    };

    const handleApplyAllFilters = (): void => {
        selectionConfig.forEach((config) => {
            const event = {
                target: {
                    value: config.selectionOptions.map(
                        (option) => option.value
                    ),
                },
            };
            config.handleChange(event);
        });
    };

    return (
        <Box
            key={i18n.language}
            sx={{
                display: "flex",
                flexDirection: "column",
                margin: "2em auto",
                maxHeight: "calc(100vh - 140px)",
                overflowY: "auto",
            }}
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
            <Button
                onClick={handleResetFilters}
                variant="contained"
                sx={{
                    mb: 2,
                    width: "180px",
                    minWidth: "0",
                    padding: "6px 16px",
                    fontSize: "0.700rem",
                    marginLeft: "auto",
                    marginRight: "auto",
                    display: "block",
                }}
            >
                {t("Delete All Filters")}
            </Button>
            <Button
                onClick={handleApplyAllFilters}
                variant="contained"
                color="primary"
                sx={{
                    mb: 2,
                    width: "180px",
                    minWidth: "0",
                    padding: "6px 16px",
                    fontSize: "0.700rem",
                    marginLeft: "auto",
                    marginRight: "auto",
                    display: "block",
                }}
            >
                {t("Apply All Filters")}
            </Button>
            <ZNAccordion
                key="howTo"
                title={howToHeading}
                content={<Markdown>{howToContent}</Markdown>}
                defaultExpanded={true}
                centerContent={false}
            />
        </Box>
    );
}
