import { Box } from "@mui/material";
// eslint-disable-next-line import/named
import React from "react";
import { SelectionFilterConfig } from "../model/Evaluations.model";
import { FilterMultiSelectionComponent } from "./FilterMultiSelectionComponent";

type FilterContainerComponentProps = {
    selectionConfig: SelectionFilterConfig[];
};
export function FilterContainerComponent({
    selectionConfig,
}: FilterContainerComponentProps): JSX.Element {
    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    padding: 2,
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                {selectionConfig.slice(0, 3).map((config) => (
                    <FilterMultiSelectionComponent
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
                    padding: 2,
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                {selectionConfig.slice(3, 6).map((config) => (
                    <FilterMultiSelectionComponent
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
                    padding: 2,
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                {selectionConfig.slice(6, 7).map((config) => (
                    <FilterMultiSelectionComponent
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
        </Box>
    );
}
