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

    // Same frame as the prevalence page's side content
    // (PrevalenceSideContent), so the two panels look alike.
    return (
        <Box
            component="section"
            aria-label={String(t("SearchOptions"))}
            sx={{
                display: "flex",
                flexDirection: "column",
                width: "430px",
                maxWidth: "95%",
                p: 2,
                boxSizing: "border-box",
                height: "100%",
                maxHeight: "100%",
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    pr: 1,
                    pt: 2,
                    pb: 4,
                }}
            >
                <Stack spacing={2.5}>
                    {TYPING_FILTER_KEYS.map(renderSelect)}
                </Stack>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 2,
                        gap: "16px",
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={onSearch}
                    >
                        {t("Search")}
                    </Button>
                    <Button variant="contained" onClick={onReset}>
                        {t("ResetFilters")}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
