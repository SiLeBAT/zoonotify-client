import { Box, Tooltip } from "@mui/material";
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

    return (
        <Box
            key={i18n.language}
            sx={{
                display: "flex",
                flexDirection: "column",
                maxHeight: "100vh",
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
