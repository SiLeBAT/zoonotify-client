import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Button,
    IconButton,
    Stack,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Grow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    OutlinedInput,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import Search from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { usePrevalenceFilters } from "./PrevalenceDataContext";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse } from "../../shared/model/CMS.model";
import i18next from "i18next";
import {
    INFORMATION,
    PEREVALENCE_INFO,
} from "../../shared/infrastructure/router/routes";
import Markdown from "markdown-to-jsx";
import { ZNAccordion } from "../../shared/components/accordion/ZNAccordion";

/** ---------- CMS content model ---------- */
interface Content {
    id: number;
    title: string;
    content: string;
}

/** ---------- Microorganism name formatter (italicize parts) ---------- */
const italicWords: string[] = [
    "Salmonella",
    "coli",
    "E.",
    "Bacillus",
    "cereus",
    "monocytogenes",
    "Clostridioides",
    "difficile",
    "Yersinia",
    "Listeria",
    "enterocolitica",
    "Vibrio",
    "Baylisascaris",
    "procyonis",
    "Echinococcus",
    "Campylobacter",
];

const formatMicroorganismName = (
    microName?: string | null
): React.ReactNode => {
    if (!microName) return null;
    const parts = microName.split(/([-\s])/).filter((p) => p.length > 0);
    return (
        <>
            {parts.map((word, i) => {
                if (word.trim() === "" || word === "-") return word; // keep separators
                const isItalic = italicWords.some((w) =>
                    word.toLowerCase().includes(w.toLowerCase())
                );
                return isItalic ? (
                    <i key={i}>{word}</i>
                ) : (
                    <span key={i}>{word}</span>
                );
            })}
        </>
    );
};
/** -------------------------------------------------------------------- */

/** ---------- Local MultiSelect ---------- */
type LocalOption = { value: string; label: string };

type LocalMultiSelectProps = {
    selected: string[];
    options: LocalOption[];
    name: string;
    label: string;
    onChange: (values: string[]) => void;
    formatLabel?: (label: string) => React.ReactNode;
    /** when true, list shows only currently selected items */
    showOnlySelected?: boolean;
};

const MENU_PROPS = {
    disableScrollLock: true,
    PaperProps: {
        sx: {
            maxHeight: { xs: "30vh", sm: "46vh" },
            overflowY: "auto",
        },
    },
} as const;

/** ===== Ellipsis helper ===== */
const LINE_CLAMP = 1 as 1 | 2;
const Ellipsis: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const singleLine = LINE_CLAMP === 1;
    return (
        <Box
            component="span"
            sx={
                singleLine
                    ? {
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                      }
                    : {
                          display: "-webkit-box",
                          WebkitLineClamp: LINE_CLAMP,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          width: "100%",
                      }
            }
        >
            {children}
        </Box>
    );
};

/**
 * Keeps list stable while open, commits on close, SelectAll (visible),
 * label memory for hidden options, and supports "showOnlySelected".
 */
const LocalMultiSelect: React.FC<LocalMultiSelectProps> = ({
    selected,
    options,
    name,
    label,
    onChange,
    formatLabel,
    showOnlySelected = false,
}) => {
    const { t } = useTranslation(["PrevalencePage"]);

    const [open, setOpen] = useState(false);
    const [staged, setStaged] = useState<string[]>(selected);
    const [frozenOptionsWhileOpen, setFrozenOptionsWhileOpen] = useState<
        LocalOption[] | null
    >(null);

    const [labelMemory, setLabelMemory] = useState<Map<string, string>>(
        new Map()
    );

    useEffect(() => {
        if (!open) setStaged(selected);
    }, [selected, open]);

    const baseList =
        open && frozenOptionsWhileOpen ? frozenOptionsWhileOpen : options;

    // when showOnlySelected, narrow visible list to selected values (use staged when open)
    const currentSelection = open ? staged : selected;
    const optionsToRender = showOnlySelected
        ? baseList.filter((o) => currentSelection.includes(o.value))
        : baseList;

    // for rendering labels even if hidden
    const valueToLabel = useMemo(() => {
        const m = new Map<string, string>();
        (open ? frozenOptionsWhileOpen ?? options : options).forEach((o) =>
            m.set(o.value, o.label)
        );
        return m;
    }, [open, options, frozenOptionsWhileOpen]);

    useEffect(() => {
        if (!options?.length) return;
        setLabelMemory((prev) => {
            const next = new Map(prev);
            // rename destructured `label` to avoid shadowing the prop `label`
            options.forEach(({ value, label: optLabel }) => {
                if (next.get(value) !== optLabel) next.set(value, optLabel);
            });
            return next;
        });
    }, [options]);

    // Select-all logic works only when not in showOnlySelected mode
    const allVisibleValues = useMemo(
        () => optionsToRender.map((o) => o.value),
        [optionsToRender]
    );
    const numCheckedVisible = useMemo(
        () => allVisibleValues.filter((v) => staged.includes(v)).length,
        [allVisibleValues, staged]
    );
    const allVisibleSelected =
        allVisibleValues.length > 0 &&
        numCheckedVisible === allVisibleValues.length;
    const someVisibleSelected = numCheckedVisible > 0 && !allVisibleSelected;

    const selectAllText = allVisibleSelected
        ? t("DESELECT_ALL", "Deselect All")
        : t("SELECT_ALL", "Select All");

    const toggleSelectAllVisible = (): void => {
        setStaged((prev) => {
            const set = new Set(prev);
            if (allVisibleSelected) {
                allVisibleValues.forEach((v) => set.delete(v));
            } else {
                allVisibleValues.forEach((v) => set.add(v));
            }
            return Array.from(set);
        });
    };

    const toggleValue = (val: string): void => {
        setStaged((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    };

    const pretty = (raw: string): React.ReactNode =>
        formatLabel ? formatLabel(raw) : raw;

    const labelFor = (val: string): React.ReactNode => {
        const raw = valueToLabel.get(val) ?? labelMemory.get(val) ?? val;
        return pretty(raw);
    };

    return (
        <FormControl fullWidth size="small">
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Select
                labelId={`${name}-label`}
                multiple
                value={open ? staged : selected}
                input={<OutlinedInput label={label} />}
                onOpen={() => {
                    setFrozenOptionsWhileOpen(options); // freeze current options so list doesn't shrink while picking
                    setStaged(selected);
                    setOpen(true);
                }}
                onClose={() => {
                    setOpen(false);
                    setFrozenOptionsWhileOpen(null);
                    onChange(staged); // commit staged selection
                }}
                onChange={(e) => {
                    const next =
                        typeof e.target.value === "string"
                            ? (e.target.value as string).split(",")
                            : (e.target.value as string[]);
                    setStaged(next);
                }}
                renderValue={(vals) => {
                    const arr = vals as string[];
                    return (
                        <Ellipsis>
                            <span>
                                {arr.map((v, i) => (
                                    <span key={v}>
                                        {labelFor(v)}
                                        {i < arr.length - 1 ? ", " : ""}
                                    </span>
                                ))}
                            </span>
                        </Ellipsis>
                    );
                }}
                sx={{
                    "& .MuiSelect-select": {
                        paddingTop: 1.8,
                        paddingBottom: 1.8,
                        fontSize: "1rem",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: LINE_CLAMP === 1 ? "nowrap" : "normal",
                    },
                    "& .MuiInputBase-input": {
                        display: "flex",
                        alignItems: "center",
                        minHeight: LINE_CLAMP === 1 ? "56px" : "68px",
                    },
                }}
                MenuProps={MENU_PROPS}
            >
                {/* Hide Select All row when showing only selected items */}
                {!showOnlySelected && (
                    <MenuItem
                        key="__select_all__"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSelectAllVisible();
                        }}
                    >
                        <Checkbox
                            checked={allVisibleSelected}
                            indeterminate={someVisibleSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={toggleSelectAllVisible}
                        />
                        <ListItemText primary={selectAllText} />
                    </MenuItem>
                )}

                {!showOnlySelected && <Box sx={{ height: 4 }} />}

                {optionsToRender.length === 0 ? (
                    <MenuItem disabled>
                        <ListItemText
                            primary={t(
                                "NO_ITEMS_SELECTED",
                                "No items selected"
                            )}
                        />
                    </MenuItem>
                ) : (
                    optionsToRender.map((opt) => {
                        const checked = (open ? staged : selected).includes(
                            opt.value
                        );
                        return (
                            <MenuItem
                                key={opt.value}
                                value={opt.value}
                                onMouseDown={(e) => e.preventDefault()} // keep menu open
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleValue(opt.value);
                                }}
                            >
                                <Checkbox
                                    checked={checked}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => toggleValue(opt.value)}
                                />
                                <ListItemText
                                    primary={pretty(opt.label)}
                                    primaryTypographyProps={{
                                        sx: { whiteSpace: "normal" },
                                    }}
                                />
                            </MenuItem>
                        );
                    })
                )}
            </Select>
        </FormControl>
    );
};
/** --------------------------------------------------------------------------- */

export function PrevalenceSideContent(): JSX.Element {
    const { t, i18n } = useTranslation(["PrevalencePage"]);
    const {
        selectedMicroorganisms,
        setSelectedMicroorganisms,
        microorganismOptions,
        selectedSampleOrigins,
        setSelectedSampleOrigins,
        sampleOriginOptions,
        selectedMatrices,
        setSelectedMatrices,
        matrixOptions,
        selectedSamplingStages,
        setSelectedSamplingStages,
        samplingStageOptions,
        selectedMatrixGroups,
        setSelectedMatrixGroups,
        matrixGroupOptions,
        selectedYear,
        setSelectedYear,
        yearOptions,
        selectedSuperCategory,
        setSelectedSuperCategory,
        superCategorySampleOriginOptions,
        fetchDataFromAPI,
        setShowError,
        fetchOptions,
        setIsSearchTriggered,
    } = usePrevalenceFilters();

    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [infoDialogTitle, setInfoDialogTitle] = useState("");
    const [infoDialogContent, setInfoDialogContent] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
    const [prevalenceInfo, setPrevalenceInfo] = useState<string>("");

    // After Search, we toggle "show selected only" per filter — but only for filters with selections
    const [showOnlySelected, setShowOnlySelected] = useState(false);

    /**
     * 🔒 Directional freeze store:
     * - key -> options snapshot captured the FIRST time user interacts with that filter
     * - earlier filters render from their snapshot forever (until language change or reset)
     * - later filters use live options from context (so forward cascade still works)
     */
    const [frozenByKey, setFrozenByKey] = useState<
        Record<string, LocalOption[]>
    >({});

    const freezeIfFirstTime = (
        key: string,
        liveOptions: LocalOption[]
    ): void => {
        setFrozenByKey((prev) =>
            prev[key] ? prev : { ...prev, [key]: liveOptions }
        );
    };

    // helper: show selected-only only if the user actually selected something in that filter
    const onlySel = (arr: unknown[]): boolean =>
        showOnlySelected && arr.length > 0;

    useEffect(() => {
        setSelectedOrder([]);
        setFrozenByKey({});
        setShowOnlySelected(false);
    }, []);

    useEffect(() => {
        const handleLanguageChange = (): void => {
            // refresh data AND clear freezes so labels re-localize
            setFrozenByKey({});
            setSelectedOrder([]);
            setShowOnlySelected(false);
            fetchOptions();
        };
        i18n.on("languageChanged", handleLanguageChange);
        return () => i18n.off("languageChanged", handleLanguageChange);
    }, [i18n, fetchOptions]);

    // Fetch Prevalence Information (accordion content)
    useEffect(() => {
        const fetchPrevalenceInfo = async (): Promise<void> => {
            try {
                const url = `${PEREVALENCE_INFO}?locale=${i18next.language}&publicationState=live`;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = await callApiService<any>(url);
                const entity = response.data?.data;
                if (!entity || !entity.content) {
                    setPrevalenceInfo("No prevalence information available.");
                    return;
                }
                setPrevalenceInfo(entity.content);
            } catch (error) {
                console.error("Failed to fetch prevalence info:", error);
                setPrevalenceInfo("Error loading prevalence information.");
            }
        };
        fetchPrevalenceInfo();
    }, [i18next.language]);

    // Info dialog fetch (per-filter descriptions)
    const handleInfoClick = async (categoryKey: string): Promise<void> => {
        const translatedCategory = t(categoryKey);
        try {
            const url = `${INFORMATION}?filters[title][$eq]=${encodeURIComponent(
                translatedCategory
            )}&locale=${i18next.language}&pagination[pageSize]=1`;
            const response = await callApiService<
                CMSResponse<Array<Content>, unknown>
            >(url);
            if (response.data && response.data.data.length > 0) {
                const entity = response.data.data[0];
                setInfoDialogTitle(entity.title);
                setInfoDialogContent(entity.content);
                setInfoDialogOpen(true);
            }
        } catch (error) {
            console.error("Failed to fetch information:", error);
        }
    };

    const handleClose = (): void => setInfoDialogOpen(false);

    const updateFilterOrder = (filter: string): void => {
        setSelectedOrder((prev) =>
            prev.includes(filter) ? prev : [...prev, filter]
        );
    };

    const handleSearch = async (): Promise<void> => {
        setShowError(false);
        await fetchDataFromAPI();
        setShowError(true);
        setShowOnlySelected(true); // turn on “selected-only” mode (conditionally per filter via onlySel)
        setIsSearchTriggered(true);
    };

    // Helper: convert context options -> LocalOption[]
    const toLocal = (
        arr: { documentId?: string; name: string }[] | undefined
    ): LocalOption[] =>
        (arr ?? [])
            .filter((o) => !!o.documentId && !!o.name)
            .map((o) => ({ value: o.documentId as string, label: o.name }));

    /** live options from context (these are the cascaded lists) */
    const liveOptions = {
        year: (yearOptions ?? []).map((y) => ({
            value: String(y),
            label: String(y),
        })),
        microorganism: toLocal(microorganismOptions),
        superCategory: toLocal(superCategorySampleOriginOptions),
        sampleOrigin: toLocal(sampleOriginOptions),
        samplingStage: toLocal(samplingStageOptions),
        matrixGroup: toLocal(matrixGroupOptions),
        matrix: toLocal(matrixOptions),
    };

    /** for each key, use frozen snapshot if it exists (earlier filters), else live list (later filters) */
    const getOptionsFor = (key: keyof typeof liveOptions): LocalOption[] =>
        frozenByKey[key] ?? liveOptions[key];

    const filterComponents: { [key: string]: JSX.Element } = {
        year: (
            <Box
                key="year"
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
            >
                <LocalMultiSelect
                    selected={selectedYear.map(String)}
                    options={getOptionsFor("year")}
                    name="years"
                    label={t("SAMPLING_YEAR")}
                    showOnlySelected={onlySel(selectedYear)}
                    onChange={(values) => {
                        freezeIfFirstTime("year", liveOptions.year);
                        const nums = values.map((v) => parseInt(v, 10));
                        setSelectedYear(nums);
                        updateFilterOrder("year");
                    }}
                />
                <Tooltip title={t("More Info on Sampling Year")}>
                    <IconButton
                        onClick={() => handleInfoClick("SAMPLING_YEAR")}
                        sx={{ ml: 0.2 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),

        microorganism: (
            <Box
                key="microorganism"
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
            >
                <LocalMultiSelect
                    selected={selectedMicroorganisms}
                    options={getOptionsFor("microorganism")}
                    name="microorganisms"
                    label={t("MICROORGANISM")}
                    formatLabel={formatMicroorganismName}
                    showOnlySelected={onlySel(selectedMicroorganisms)}
                    onChange={(vals) => {
                        freezeIfFirstTime(
                            "microorganism",
                            liveOptions.microorganism
                        );
                        setSelectedMicroorganisms(vals);
                        updateFilterOrder("microorganism");
                    }}
                />
                <Tooltip title={t("More Info on Microorganisms")}>
                    <IconButton
                        onClick={() => handleInfoClick("MICROORGANISM")}
                        sx={{ ml: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),

        superCategory: (
            <Box
                key="superCategory"
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
            >
                <LocalMultiSelect
                    selected={selectedSuperCategory}
                    options={getOptionsFor("superCategory")}
                    name="superCategories"
                    label={t("SUPER-CATEGORY-SAMPLE-ORIGIN")}
                    showOnlySelected={onlySel(selectedSuperCategory)}
                    onChange={(vals) => {
                        freezeIfFirstTime(
                            "superCategory",
                            liveOptions.superCategory
                        );
                        setSelectedSuperCategory(vals);
                        updateFilterOrder("superCategory");
                    }}
                />
                <Tooltip title={t("More Info on Super Categories")}>
                    <IconButton
                        onClick={() =>
                            handleInfoClick("SUPER-CATEGORY-SAMPLE-ORIGIN")
                        }
                        sx={{ ml: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),

        sampleOrigin: (
            <Box
                key="sampleOrigin"
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
            >
                <LocalMultiSelect
                    selected={selectedSampleOrigins}
                    options={getOptionsFor("sampleOrigin")}
                    name="sampleOrigins"
                    label={t("SAMPLE_ORIGIN")}
                    showOnlySelected={onlySel(selectedSampleOrigins)}
                    onChange={(vals) => {
                        freezeIfFirstTime(
                            "sampleOrigin",
                            liveOptions.sampleOrigin
                        );
                        setSelectedSampleOrigins(vals);
                        updateFilterOrder("sampleOrigin");
                    }}
                />
                <Tooltip title={t("More Info on Sample Origins")}>
                    <IconButton
                        onClick={() => handleInfoClick("SAMPLE_ORIGIN")}
                        sx={{ ml: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),

        samplingStage: (
            <Box
                key="samplingStage"
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
            >
                <LocalMultiSelect
                    selected={selectedSamplingStages}
                    options={getOptionsFor("samplingStage")}
                    name="samplingStages"
                    label={t("SAMPLING_STAGE")}
                    showOnlySelected={onlySel(selectedSamplingStages)}
                    onChange={(vals) => {
                        freezeIfFirstTime(
                            "samplingStage",
                            liveOptions.samplingStage
                        );
                        setSelectedSamplingStages(vals);
                        updateFilterOrder("samplingStage");
                    }}
                />
                <Tooltip title={t("More Info on Sampling Stages")}>
                    <IconButton
                        onClick={() => handleInfoClick("SAMPLING_STAGE")}
                        sx={{ ml: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),

        matrixGroup: (
            <Box
                key="matrixGroup"
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
            >
                <LocalMultiSelect
                    selected={selectedMatrixGroups}
                    options={getOptionsFor("matrixGroup")}
                    name="matrixGroups"
                    label={t("MATRIX_GROUP")}
                    showOnlySelected={onlySel(selectedMatrixGroups)}
                    onChange={(vals) => {
                        freezeIfFirstTime(
                            "matrixGroup",
                            liveOptions.matrixGroup
                        );
                        setSelectedMatrixGroups(vals);
                        updateFilterOrder("matrixGroup");
                    }}
                />
                <Tooltip title={t("More Info on Matrix Groups")}>
                    <IconButton onClick={() => handleInfoClick("MATRIX_GROUP")}>
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),

        matrix: (
            <Box
                key="matrix"
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
            >
                <LocalMultiSelect
                    selected={selectedMatrices}
                    options={getOptionsFor("matrix")}
                    name="matrices"
                    label={t("MATRIX")}
                    showOnlySelected={onlySel(selectedMatrices)}
                    onChange={(vals) => {
                        freezeIfFirstTime("matrix", liveOptions.matrix);
                        setSelectedMatrices(vals);
                        updateFilterOrder("matrix");
                    }}
                />
                <Tooltip title={t("More Info on Matrices")}>
                    <IconButton
                        onClick={() => handleInfoClick("MATRIX")}
                        sx={{ ml: 0.5 }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
    };

    const getTransitionIn = (): boolean => true;

    const orderedComponents = selectedOrder.map((key: string) => (
        <Grow in={getTransitionIn()} timeout={500} key={key}>
            {filterComponents[key]}
        </Grow>
    ));

    const remainingComponents = Object.keys(filterComponents)
        .filter((key: string) => !selectedOrder.includes(key))
        .map((key: string) => (
            <Grow in={getTransitionIn()} timeout={500} key={key}>
                {filterComponents[key]}
            </Grow>
        ));

    const resetFilters = async (): Promise<void> => {
        setSelectedMicroorganisms([]);
        setSelectedSampleOrigins([]);
        setSelectedMatrices([]);
        setSelectedSamplingStages([]);
        setSelectedMatrixGroups([]);
        setSelectedYear([]);
        setSelectedSuperCategory([]);
        setSelectedOrder([]);
        setFrozenByKey({});
        setShowOnlySelected(false);
        setIsSearchTriggered(false);
        setShowError(false);
        await fetchOptions();
        window.history.replaceState(null, "", window.location.pathname);
    };

    return (
        <Box
            sx={{
                padding: "10px",
                height: "120vh",
                p: 2,
                overflowY: "auto",
                width: "430px",
                maxHeight: "calc(140vh)",
                maxWidth: "95%",
            }}
        >
            <Stack spacing={2.5} alignItems="flex-start">
                {orderedComponents}
                {remainingComponents}
            </Stack>

            {/* Info dialog */}
            <Dialog open={infoDialogOpen} onClose={handleClose}>
                <DialogTitle>{infoDialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText component="div">
                        <Markdown
                            options={{
                                overrides: {
                                    a: {
                                        props: {
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                        },
                                    },
                                    p: {
                                        component: "p",
                                        props: {
                                            style: {
                                                marginTop: 0,
                                                marginBottom: 8,
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            {infoDialogContent}
                        </Markdown>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t("CLOSE", "Close")}</Button>
                </DialogActions>
            </Dialog>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 2,
                    gap: "16px",
                }}
            >
                <Button
                    variant="contained"
                    startIcon={<Search />}
                    onClick={handleSearch}
                >
                    {t("SEARCH")}
                </Button>
                <Button variant="contained" onClick={resetFilters}>
                    {t("RESET_FILTERS")}
                </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
                <ZNAccordion
                    title={t("PREVALENCE_INFORMATION")}
                    content={
                        <Markdown
                            options={{
                                overrides: {
                                    a: {
                                        props: {
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                        },
                                    },
                                    p: {
                                        component: "p",
                                        props: {
                                            style: {
                                                marginTop: -1,
                                                marginBottom: 0,
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            {prevalenceInfo}
                        </Markdown>
                    }
                    defaultExpanded={true}
                    centerContent={false}
                />
            </Box>
        </Box>
    );
}
