import React from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    IconButton,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    Stack,
    Tooltip,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import {
    TYPING_FILTER_KEYS,
    TypingFilterKey,
    TypingFilterOption,
    TypingSelection,
} from "./typingFilters";

/**
 * Label and info-entry keys per filter. The label keys are the CMS
 * `information` titles the info icon looks up, as on the AMR trend page.
 */
export const TYPING_FILTER_LABELS: Record<
    TypingFilterKey,
    { label: string; info: string }
> = {
    superCategorySampleOrigin: {
        label: "SUPER-CATEGORY-SAMPLE-ORIGIN",
        info: "More Info on Super Categories",
    },
    sampleOrigin: {
        label: "SAMPLE_ORIGIN",
        info: "More Info on Sample Origins",
    },
    samplingStage: {
        label: "SAMPLING_STAGE",
        info: "More Info on Sampling Stages",
    },
    matrixGroup: { label: "MATRIX_GROUP", info: "More Info on Matrix Groups" },
    matrix: { label: "MATRIX", info: "More Info on Matrices" },
};

const BUTTON_SX = { minWidth: 120, background: "#003663" };

/** The typing page's Search Options panel, after the AMR trend page (#1948). */
export function TypingSearchOptions({
    options,
    selection,
    onChange,
    onSearch,
    onReset,
    onInfo,
}: {
    options: Record<TypingFilterKey, TypingFilterOption[]>;
    selection: TypingSelection;
    onChange: (selection: TypingSelection) => void;
    onSearch: () => void;
    onReset: () => void;
    onInfo: (labelKey: string) => void;
}): JSX.Element {
    const { t } = useTranslation(["MicrobialTyping"]);

    const renderSelect = (key: TypingFilterKey): JSX.Element => {
        const { label, info } = TYPING_FILTER_LABELS[key];
        const labelId = `typing-filter-${key}`;
        const keyOptions = options[key];
        const value = selection[key];
        const handleChange = (event: SelectChangeEvent<string[]>): void => {
            const next = event.target.value;
            onChange({
                ...selection,
                [key]: typeof next === "string" ? next.split(",") : next,
            });
        };
        return (
            <Stack key={key} direction="row" spacing={1} alignItems="center">
                <FormControl fullWidth>
                    <InputLabel id={labelId}>{t(label)}</InputLabel>
                    <Select
                        labelId={labelId}
                        multiple
                        value={value}
                        onChange={handleChange}
                        label={t(label)}
                        renderValue={(ids) =>
                            keyOptions
                                .filter((o) => ids.includes(o.documentId))
                                .map((o) => o.name)
                                .join(", ")
                        }
                        MenuProps={{
                            PaperProps: { style: { maxHeight: 400 } },
                        }}
                    >
                        {keyOptions.length === 0 ? (
                            <MenuItem disabled value="">
                                {t("NoOptions")}
                            </MenuItem>
                        ) : (
                            keyOptions.map((option) => (
                                <MenuItem
                                    key={option.documentId}
                                    value={option.documentId}
                                >
                                    <Checkbox
                                        checked={value.includes(
                                            option.documentId
                                        )}
                                    />
                                    <ListItemText primary={option.name} />
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
                <Tooltip title={t(info)}>
                    <IconButton
                        size="small"
                        aria-label={t(info)}
                        onClick={() => onInfo(label)}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
        );
    };

    return (
        <Box
            component="section"
            aria-label={String(t("SearchOptions"))}
            sx={{
                p: 3,
                width: "380px",
                maxWidth: "95%",
                // Fill the panel SidebarComponent hands down so this pane
                // owns its scrollbar and Search/Reset stay reachable.
                height: "100%",
                overflowY: "auto",
                boxSizing: "border-box",
            }}
        >
            <Stack spacing={2}>{TYPING_FILTER_KEYS.map(renderSelect)}</Stack>
            <Box mt={4} display="flex" justifyContent="center" gap={2}>
                <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    sx={BUTTON_SX}
                    onClick={onSearch}
                >
                    {t("Search")}
                </Button>
                <Button variant="contained" sx={BUTTON_SX} onClick={onReset}>
                    {t("ResetFilters")}
                </Button>
            </Box>
        </Box>
    );
}
