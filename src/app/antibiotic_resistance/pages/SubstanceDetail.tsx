import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Button,
    Typography,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Alert,
    Checkbox,
    ListItemText,
} from "@mui/material";
import type { MenuProps } from "@mui/material/Menu";

import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse } from "../../shared/model/CMS.model";
import { getGroupKey, SubstanceChart } from "./SubstanceChart";
import LZString from "lz-string";

import i18next from "i18next";
import {
    INFORMATION,
    RESISTANCES,
    SUBSTANCE_INFORMATION,
} from "../../shared/infrastructure/router/routes";
import Markdown from "markdown-to-jsx";
import type { SelectChangeEvent } from "@mui/material/Select";

// --- All filter option keys
type FilterKey =
    | "samplingYear"
    | "antimicrobialSubstance"
    | "specie"
    | "superCategorySampleOrigin"
    | "sampleOrigin"
    | "samplingStage"
    | "matrixGroup"
    | "matrix";

type FilterOption = {
    id: string;
    name: string;
    documentId: string;
};

const emptyFilterState: Record<FilterKey, string[]> = {
    samplingYear: [],
    antimicrobialSubstance: [],
    specie: [],
    superCategorySampleOrigin: [],
    sampleOrigin: [],
    samplingStage: [],
    matrixGroup: [],
    matrix: [],
};

export interface ResistanceApiItem {
    id: number;
    samplingYear: number;
    superCategorySampleOrigin?: {
        id: number;
        name: string;
        documentId: string;
    } | null;
    sampleOrigin?: { id: number; name: string; documentId: string } | null;
    samplingStage?: { id: number; name: string; documentId: string } | null;
    matrixGroup?: { id: number; name: string; documentId: string } | null;
    matrix?: { id: number; name: string; documentId: string } | null;
    antimicrobialSubstance?: {
        id: number;
        name: string;
        documentId: string;
    } | null;
    specie?: { id: number; name: string; documentId: string } | null;
    resistenzrate: number;
    anzahlGetesteterIsolate: number;
    anzahlResistenterIsolate: number;
    minKonfidenzintervall: number;
    maxKonfidenzintervall: number;
}

function shouldShowSpeciesFilter(microorganism: string): boolean {
    return (
        microorganism === "Campylobacter spp." ||
        microorganism === "Enterococcus spp."
    );
}

const menuItemTextStyle = `.menu-item-text-wrap {
    white-space: normal !important;
    word-break: break-word !important;
    max-width: 260px;
    display: block;
}`;

// ======== URL STATE HELPERS (for deep linking) ========
// ---- Short URL helpers (add this block) ----
type ShortKey =
    | "y" // samplingYear
    | "a" // antimicrobialSubstance
    | "s" // specie
    | "u" // superCategorySampleOrigin
    | "o" // sampleOrigin
    | "g" // samplingStage
    | "mG" // matrixGroup
    | "m"; // matrix

const SHORT_MAP: Record<ShortKey, FilterKey> = {
    y: "samplingYear",
    a: "antimicrobialSubstance",
    s: "specie",
    u: "superCategorySampleOrigin",
    o: "sampleOrigin",
    g: "samplingStage",
    mG: "matrixGroup",
    m: "matrix",
};

const LONG_TO_SHORT = Object.fromEntries(
    Object.entries(SHORT_MAP).map(([shortK, longK]) => [longK, shortK])
) as Record<FilterKey, ShortKey>;

function encodeStateToParam(
    microorganism: string,
    selected: Record<FilterKey, string[]>,
    substanceFilter: string[],
    lang: string
): string {
    const f: Partial<Record<ShortKey, string[]>> = {};
    (Object.keys(selected) as FilterKey[]).forEach((k) => {
        const val = selected[k];
        if (val && val.length) f[LONG_TO_SHORT[k]] = val;
    });
    if (substanceFilter.length) {
        f[LONG_TO_SHORT.antimicrobialSubstance] = substanceFilter;
    }

    const payload = { m: microorganism, v: "substance", l: lang, f };
    return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

function decodeStateFromParam(sParam: string | null): {
    microorganism?: string;
    lang?: string;
    selected: Record<FilterKey, string[]>;
    substanceFilter: string[];
} | null {
    if (!sParam) return null;
    try {
        const json = LZString.decompressFromEncodedURIComponent(sParam);
        if (!json) return null;
        const { m, l, f } = JSON.parse(json) as {
            m?: string;
            l?: string;
            f?: Partial<Record<ShortKey, string[]>>;
        };
        const selected: Record<FilterKey, string[]> = { ...emptyFilterState };
        (Object.keys(f || {}) as ShortKey[]).forEach((sk) => {
            const longKey = SHORT_MAP[sk];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (longKey) selected[longKey] = (f as any)[sk] || [];
        });
        const substanceFilter = selected.antimicrobialSubstance || [];
        return { microorganism: m, lang: l, selected, substanceFilter };
    } catch {
        return null;
    }
}

// Writer: set ?s=... in the address bar
function updateSubstanceFilterUrlCompressed(
    microorganism: string,
    selected: Record<FilterKey, string[]>,
    substanceFilter: string[]
): void {
    const s = encodeStateToParam(
        microorganism,
        selected,
        substanceFilter,
        i18next.language
    );
    window.history.replaceState(null, "", `?s=${s}`);
}

// Reader: prefer compressed; fall back to legacy params (so old links still work)
function readStateFromUrlCompressed(
    allSubstances: FilterOption[],
    allYears: FilterOption[],
    microorganism: string
): { selected: Record<FilterKey, string[]>; substanceFilter: string[] } {
    const params = new URLSearchParams(window.location.search);
    const decoded = decodeStateFromParam(params.get("s"));
    if (decoded) {
        const selected = decoded.selected || { ...emptyFilterState };
        if (!selected.samplingYear?.length) {
            selected.samplingYear = allYears.map((y) => y.documentId);
        }
        const sf = decoded.substanceFilter.length
            ? decoded.substanceFilter
            : allSubstances.map((s) => s.documentId);
        return { selected, substanceFilter: sf };
    }

    // Legacy reader (your old behavior)
    const legacySelected: Record<FilterKey, string[]> = { ...emptyFilterState };
    (Object.keys(emptyFilterState) as FilterKey[]).forEach((key) => {
        const val = params.get(key);
        legacySelected[key] = val ? val.split(",").filter(Boolean) : [];
    });
    if (!params.get("samplingYear")) {
        legacySelected.samplingYear = allYears.map((y) => y.documentId);
    }
    const legacySubstanceParam = params.get("antimicrobialSubstance");
    const legacySubstanceFilter =
        legacySubstanceParam?.split(",").filter(Boolean) ??
        allSubstances.map((s) => s.documentId);

    // Immediately rewrite to compressed for cleanliness
    const sNew = encodeStateToParam(
        microorganism,
        legacySelected,
        legacySubstanceFilter,
        i18next.language
    );
    window.history.replaceState(null, "", `?s=${sNew}`);

    return { selected: legacySelected, substanceFilter: legacySubstanceFilter };
}

const SELECT_WIDTH = 760;

export const selectSx = {
    width: SELECT_WIDTH,
    "& .MuiSelect-select": {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
};

// 👇 give the object the right type so TS keeps the literal unions
export const fixedMenuProps: Partial<MenuProps> = {
    PaperProps: {
        sx: { minWidth: SELECT_WIDTH },
        style: { maxHeight: 400 },
    },
    anchorOrigin: { vertical: "bottom", horizontal: "left" },
    transformOrigin: { vertical: "top", horizontal: "left" },
};

// ======================= COMPONENT =============================

export const SubstanceDetail: React.FC<{
    microorganism: string;
    onShowMain: () => void;
}> = ({ microorganism }) => {
    const { t } = useTranslation(["Antibiotic"]);

    const [resistanceRawData, setResistanceRawData] = useState<
        ResistanceApiItem[]
    >([]);
    const [filterOptions, setFilterOptions] = useState<
        Record<FilterKey, FilterOption[]>
    >({
        samplingYear: [],
        antimicrobialSubstance: [],
        specie: [],
        superCategorySampleOrigin: [],
        sampleOrigin: [],
        samplingStage: [],
        matrixGroup: [],
        matrix: [],
    });
    const [selected, setSelected] = useState<Record<FilterKey, string[]>>({
        ...emptyFilterState,
    });
    const [filteredFullData, setFilteredFullData] = useState<
        ResistanceApiItem[]
    >([]);
    const [showResults, setShowResults] = useState(false);
    const [availableCombinations, setAvailableCombinations] = useState<
        string[]
    >([]);
    const [selectedCombinations, setSelectedCombinations] = useState<string[]>(
        []
    );

    const [maxComboDialogOpen, setMaxComboDialogOpen] = useState(false);

    // For substances multi-select at top
    const [substanceFilter, setSubstanceFilter] = useState<string[]>([]);
    // To update available substance options
    const [allSubstances, setAllSubstances] = useState<FilterOption[]>([]);
    const [allYears, setAllYears] = useState<FilterOption[]>([]);

    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [infoDialogTitle, setInfoDialogTitle] = useState("");
    const [infoDialogContent, setInfoDialogContent] = useState("");
    const [substanceInfo, setSubstanceInfo] = useState<{
        title: string;
        description: string;
    } | null>(null);
    const [substanceInfoLoading, setSubstanceInfoLoading] = useState(false);
    const [substanceInfoError, setSubstanceInfoError] = useState<string | null>(
        null
    );

    // For chart year dropdown
    const [chartYear, setChartYear] = useState<number | undefined>(undefined);

    // Helper for extracting unique filter options using documentId
    function unique<
        T extends { id?: number | string; name?: string; documentId?: string }
    >(arr: (T | null | undefined)[]): FilterOption[] {
        const map = new Map<string, { id: string; name: string }>();
        arr.forEach((item) => {
            if (item && item.documentId && item.name && item.id !== undefined) {
                map.set(item.documentId, {
                    id: String(item.id),
                    name: item.name,
                });
            }
        });
        return Array.from(map.entries()).map(([documentId, { id, name }]) => ({
            id,
            name,
            documentId,
        }));
    }

    // --- Moved handleSearch UP, before useEffect that calls it ---
    const filterDataWithSelected = useCallback(
        (sel = selected, sub = substanceFilter): ResistanceApiItem[] => {
            let result = resistanceRawData;
            if (sel.samplingYear.length)
                result = result.filter((r) =>
                    sel.samplingYear.includes(String(r.samplingYear))
                );
            if (sel.specie.length)
                result = result.filter(
                    (r) => r.specie && sel.specie.includes(r.specie.documentId)
                );
            if (sel.superCategorySampleOrigin.length)
                result = result.filter(
                    (r) =>
                        r.superCategorySampleOrigin &&
                        sel.superCategorySampleOrigin.includes(
                            r.superCategorySampleOrigin.documentId
                        )
                );
            if (sel.sampleOrigin.length)
                result = result.filter(
                    (r) =>
                        r.sampleOrigin &&
                        sel.sampleOrigin.includes(r.sampleOrigin.documentId)
                );
            if (sel.samplingStage.length)
                result = result.filter(
                    (r) =>
                        r.samplingStage &&
                        sel.samplingStage.includes(r.samplingStage.documentId)
                );
            if (sel.matrixGroup.length)
                result = result.filter(
                    (r) =>
                        r.matrixGroup &&
                        sel.matrixGroup.includes(r.matrixGroup.documentId)
                );
            if (sel.matrix.length)
                result = result.filter(
                    (r) => r.matrix && sel.matrix.includes(r.matrix.documentId)
                );
            if (sub.length)
                result = result.filter(
                    (r) =>
                        r.antimicrobialSubstance &&
                        sub.includes(r.antimicrobialSubstance.documentId)
                );
            return result;
        },
        [resistanceRawData, selected, substanceFilter]
    );

    // ----------- MOVED handleSearch UP -----------
    const handleSearch = (sel = selected, sub = substanceFilter): void => {
        const filtered = filterDataWithSelected(sel, sub);
        setFilteredFullData(filtered);
        setShowResults(true);
        const years = Array.from(
            new Set(filtered.map((d) => d.samplingYear))
        ).sort((a, b) => b - a);
        setChartYear(years.length > 0 ? years[0] : undefined);
        updateSubstanceFilterUrlCompressed(microorganism, sel, sub);
    };
    // ---------------------------------------------
    useEffect(() => {
        if (!filteredFullData.length || !chartYear) {
            setAvailableCombinations([]);
            setSelectedCombinations([]);
            return;
        }
        // Only use data for the selected year
        const yearData = filteredFullData.filter(
            (d) => d.samplingYear === chartYear
        );

        // Compute group keys for current year only
        const groupKeys = Array.from(
            new Set(yearData.map((d) => getGroupKey(d, microorganism)))
        );
        setAvailableCombinations(groupKeys);

        // Always auto-select up to 4 valid combinations for this year
        setSelectedCombinations((prev) => {
            const newSelected = prev.filter((g) => groupKeys.includes(g));
            if (newSelected.length < 4) {
                for (
                    let i = 0;
                    i < groupKeys.length && newSelected.length < 4;
                    ++i
                ) {
                    const gk = groupKeys[i];
                    if (!newSelected.includes(gk)) {
                        newSelected.push(gk);
                    }
                }
            }
            return newSelected;
        });
    }, [filteredFullData, microorganism, chartYear]);

    // DATA FETCHING
    useEffect(() => {
        async function fetchResistanceOptions(): Promise<void> {
            setLoading(true);
            setFetchError(null);
            try {
                const url =
                    `${RESISTANCES}?locale=${i18next.language}` +
                    `&filters[microorganism][name][$eq]=${encodeURIComponent(
                        microorganism
                    )}` +
                    `&populate=*&pagination[pageSize]=8000`;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const res = await callApiService<any>(url);
                setResistanceRawData(res.data?.data || []);
            } catch (err) {
                setFetchError(
                    "Failed to fetch filter options. Please try again."
                );
                console.error("Failed to fetch resistance options", err);
            } finally {
                setLoading(false);
            }
        }
        if (microorganism) {
            fetchResistanceOptions();
            setShowResults(false);
        }
    }, [i18next.language, microorganism]);

    // Set options for all filters (use documentId as key for all) & read URL
    useEffect(() => {
        // Years (as documentId = value)
        const years = Array.from(
            new Set(
                resistanceRawData
                    .map((i) => i.samplingYear)
                    .filter(Boolean)
                    .map(String)
            )
        ).sort();
        const samplingYear = years.map((y) => ({
            id: y,
            name: y,
            documentId: y,
        }));

        const specie = unique(resistanceRawData.map((i) => i.specie));
        const superCategorySampleOrigin = unique(
            resistanceRawData.map((i) => i.superCategorySampleOrigin)
        );
        const sampleOrigin = unique(
            resistanceRawData.map((i) => i.sampleOrigin)
        );
        const samplingStage = unique(
            resistanceRawData.map((i) => i.samplingStage)
        );
        const matrixGroup = unique(resistanceRawData.map((i) => i.matrixGroup));
        const matrix = unique(resistanceRawData.map((i) => i.matrix));
        const antimicrobialSubstance = unique(
            resistanceRawData.map((i) => i.antimicrobialSubstance)
        );

        setFilterOptions({
            samplingYear,
            specie,
            superCategorySampleOrigin,
            sampleOrigin,
            samplingStage,
            matrixGroup,
            matrix,
            antimicrobialSubstance,
        });
        setAllSubstances(antimicrobialSubstance);
        setAllYears(samplingYear);

        // --- DEEP LINKING: Set filters from URL
        const { selected: urlSelected, substanceFilter: urlSubstanceFilter } =
            readStateFromUrlCompressed(
                antimicrobialSubstance,
                samplingYear,
                microorganism
            );

        setSelected(urlSelected);
        setSubstanceFilter(urlSubstanceFilter);

        // --- AUTO-SEARCH if URL contains any filter or view=substance
        if (
            urlSubstanceFilter.length > 0 ||
            Object.values(urlSelected).some((arr) => arr.length > 0) ||
            window.location.search.includes("view=substance")
        ) {
            setTimeout(() => {
                handleSearch(urlSelected, urlSubstanceFilter); // <--- Now handleSearch is defined above!
            }, 0);
        }
    }, [resistanceRawData]);

    useEffect(() => {
        let cancelled = false;
        async function fetchSubstanceInfo(): Promise<void> {
            setSubstanceInfoLoading(true);
            setSubstanceInfoError(null);
            try {
                const url = `${SUBSTANCE_INFORMATION}?locale=${i18next.language}`;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = await callApiService<any>(url);
                const data = response?.data?.data;
                if (!cancelled && data) {
                    const title = data.title ?? data.attributes?.title ?? "";
                    const description =
                        data.description ?? data.attributes?.description ?? "";
                    setSubstanceInfo({ title, description });
                }
            } catch (e) {
                if (!cancelled) {
                    setSubstanceInfoError(
                        "Failed to load substance information."
                    );
                    setSubstanceInfo(null);
                }
            } finally {
                if (!cancelled) setSubstanceInfoLoading(false);
            }
        }
        fetchSubstanceInfo();
        return () => {
            cancelled = true;
        };
    }, [i18next.language]);

    // Filtering logic (already above!)

    // RESET
    const resetFilters = (): void => {
        setSelected({
            ...emptyFilterState,
            samplingYear: allYears.map((a) => a.documentId),
        });
        setShowResults(false);
        setSubstanceFilter(allSubstances.map((a) => a.documentId));
        setChartYear(undefined);
        updateSubstanceFilterUrlCompressed(
            microorganism,
            {
                ...emptyFilterState,
                samplingYear: allYears.map((a) => a.documentId),
            },
            allSubstances.map((a) => a.documentId)
        );
    };

    // Info dialog logic unchanged
    const handleInfoClick = async (categoryKey: string): Promise<void> => {
        const translatedCategory = t(categoryKey);
        try {
            const url = `${INFORMATION}?filters[title][$eq]=${encodeURIComponent(
                translatedCategory
            )}&locale=${i18next.language}&pagination[pageSize]=1`;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await callApiService<
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                CMSResponse<Array<any>, unknown>
            >(url);
            if (response.data && response.data.data.length > 0) {
                const entity = response.data.data[0];
                setInfoDialogTitle(entity.title);
                setInfoDialogContent(entity.content);
                setInfoDialogOpen(true);
            }
        } catch (err) {
            console.error("Failed to fetch information:", err);
        }
    };
    const handleClose = (): void => setInfoDialogOpen(false);

    // Multi-select substance filter at the TOP
    function renderSubstanceFilter(): JSX.Element {
        const substances = allSubstances;
        const allSelected =
            substances.length > 0 &&
            substanceFilter.length === substances.length;
        const someSelected = substanceFilter.length > 0 && !allSelected;

        const handleChange = (event: SelectChangeEvent<string[]>): void => {
            const v = event.target.value as string[];

            let newSubstanceFilter: string[];
            if (v.includes("all")) {
                newSubstanceFilter = allSelected
                    ? []
                    : substances.map((a) => a.documentId);
            } else {
                newSubstanceFilter = v;
            }

            // 1) update state
            setSubstanceFilter(newSubstanceFilter);

            // 2) immediately re-run the search with the new value
            //    (pass current `selected` plus the new substance array)
            handleSearch(selected, newSubstanceFilter);
        };

        return (
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 3 }}
            >
                <FormControl sx={{ width: SELECT_WIDTH }}>
                    <InputLabel>{t("ANTIBIOTIC_SUBSTANCE")}</InputLabel>
                    <Select
                        multiple
                        value={substanceFilter}
                        onChange={handleChange}
                        label={t("ANTIBIOTIC_SUBSTANCE")}
                        renderValue={(selectedItems) =>
                            Array.isArray(selectedItems)
                                ? substances
                                      .filter((o) =>
                                          selectedItems.includes(o.documentId)
                                      )
                                      .map((o) => t(o.name))
                                      .join(", ")
                                : ""
                        }
                        MenuProps={fixedMenuProps}
                    >
                        <MenuItem value="all">
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected}
                            />
                            <ListItemText
                                primary={
                                    allSelected
                                        ? t("DESELECT_ALL") || "Deselect All"
                                        : t("SELECT_ALL") || "Select All"
                                }
                            />
                        </MenuItem>

                        {substances.length === 0 ? (
                            <MenuItem disabled value="">
                                {t("No options")}
                            </MenuItem>
                        ) : (
                            substances.map((item) => (
                                <MenuItem
                                    key={item.documentId}
                                    value={item.documentId}
                                >
                                    <Checkbox
                                        checked={
                                            substanceFilter.indexOf(
                                                item.documentId
                                            ) > -1
                                        }
                                    />
                                    <ListItemText primary={t(item.name)} />
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>

                <Tooltip title={t("More Info on Antibiotic Substances")}>
                    <IconButton
                        size="small"
                        onClick={() => handleInfoClick("ANTIBIOTIC_SUBSTANCE")}
                    >
                        <InfoIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        );
    }
    // Multi-select with Select All for sidebar (includes year filter!)
    function renderSelectWithSelectAll(
        key: FilterKey,
        label: string,
        infoKey: string,
        categoryKey: string
    ): JSX.Element {
        if (key === "antimicrobialSubstance") return <></>;
        const options = filterOptions[key];
        const value = selected[key]; // array of documentIds (or year as string)
        const allSelected =
            options.length > 0 && value.length === options.length;
        const someSelected = value.length > 0 && !allSelected;
        const handleChange = (event: SelectChangeEvent<string[]>): void => {
            const v = event.target.value as string[];
            if (v.includes("all")) {
                setSelected((prev) => ({
                    ...prev,
                    [key]: allSelected ? [] : options.map((o) => o.documentId),
                }));
            } else {
                setSelected((prev) => ({ ...prev, [key]: v }));
            }
        };

        return (
            <Stack direction="row" spacing={1} alignItems="center">
                <FormControl fullWidth>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        multiple
                        value={value}
                        onChange={handleChange}
                        label={label}
                        renderValue={(selectedItems) =>
                            Array.isArray(selectedItems)
                                ? options
                                      .filter((o) =>
                                          selectedItems.includes(o.documentId)
                                      )
                                      .map((o) => t(o.name))
                                      .join(", ")
                                : ""
                        }
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 400,
                                },
                            },
                        }}
                    >
                        <MenuItem value="all">
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected}
                            />
                            <ListItemText
                                className="menu-item-text-wrap"
                                primary={
                                    allSelected
                                        ? t("DESELECT_ALL") || "Deselect All"
                                        : t("SELECT_ALL") || "Select All"
                                }
                            />
                        </MenuItem>
                        {options.length === 0 ? (
                            <MenuItem disabled value="">
                                {t("No options")}
                            </MenuItem>
                        ) : (
                            options.map((item) => (
                                <MenuItem
                                    key={item.documentId}
                                    value={item.documentId}
                                >
                                    <Checkbox
                                        checked={value.includes(
                                            item.documentId
                                        )}
                                    />
                                    <ListItemText
                                        className="menu-item-text-wrap"
                                        primary={
                                            key === "specie" ? (
                                                <span
                                                    style={{
                                                        fontStyle: "italic",
                                                        fontWeight: 400,
                                                        fontSize: "1rem",
                                                    }}
                                                >
                                                    {t(item.name)}
                                                </span>
                                            ) : (
                                                t(item.name)
                                            )
                                        }
                                    />
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
                <Tooltip title={t(infoKey)}>
                    <IconButton
                        size="small"
                        onClick={() => handleInfoClick(categoryKey)}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
        );
    }

    // Compute available years for the chart (based on filtered data)
    const availableYears = Array.from(
        new Set(filteredFullData.map((d) => d.samplingYear))
    ).sort((a, b) => b - a);

    // Chart year dropdown component (shown only if there are results)
    function renderChartYearDropdown(): JSX.Element | null {
        if (!availableYears.length) return null;
        return (
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
            >
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>{t("SAMPLING_YEAR")}</InputLabel>
                    <Select
                        value={chartYear ?? ""}
                        label={t("SAMPLING_YEAR")}
                        onChange={(e) => setChartYear(Number(e.target.value))}
                    >
                        {availableYears.map((y) => (
                            <MenuItem key={y} value={y}>
                                {y}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Tooltip title={t("More Info on Sampling Year")}>
                    <IconButton
                        size="small"
                        onClick={() => handleInfoClick("SAMPLING_YEAR")}
                        sx={{ ml: 0.5 }}
                    >
                        <InfoIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        );
    }

    // --- When filters change, but after first load, keep URL up to date (but don't auto search again!)
    useEffect(() => {
        updateSubstanceFilterUrlCompressed(
            microorganism,
            selected,
            substanceFilter
        );
    }, [selected, substanceFilter, microorganism]);

    return (
        <>
            <style>{menuItemTextStyle}</style>
            <Box display="flex" flexDirection="row">
                {/* SIDEBAR */}
                <Paper
                    elevation={2}
                    sx={{
                        position: "fixed",
                        left: 0,
                        top: 56,
                        width: 380,
                        height: "calc(100vh - 75px)",
                        bgcolor: "#fff",
                        borderRight: "1px solid #e0e0e0",
                        p: 0,
                        overflow: "hidden",
                        zIndex: 1000,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            overflowY: "auto",
                            p: 3,
                        }}
                    >
                        <Typography variant="h5" align="center" mb={2}>
                            {t("Search options")}
                        </Typography>
                        {loading && (
                            <Stack alignItems="center" my={3}>
                                <CircularProgress />
                                <Typography variant="body2" mt={1}>
                                    {t("Loading filter options...")}
                                </Typography>
                            </Stack>
                        )}
                        {fetchError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {fetchError}
                            </Alert>
                        )}
                        <Stack spacing={2} sx={{ opacity: loading ? 0.5 : 1 }}>
                            {shouldShowSpeciesFilter(microorganism) &&
                                renderSelectWithSelectAll(
                                    "specie",
                                    t("SPECIES"),
                                    "More Info on Species",
                                    "SPECIES"
                                )}
                            {renderSelectWithSelectAll(
                                "superCategorySampleOrigin",
                                t("SUPER-CATEGORY-SAMPLE-ORIGIN"),
                                "More Info on Super Categories",
                                "SUPER-CATEGORY-SAMPLE-ORIGIN"
                            )}
                            {renderSelectWithSelectAll(
                                "sampleOrigin",
                                t("SAMPLE_ORIGIN"),
                                "More Info on Sample Origins",
                                "SAMPLE_ORIGIN"
                            )}
                            {renderSelectWithSelectAll(
                                "samplingStage",
                                t("SAMPLING_STAGE"),
                                "More Info on Sampling Stages",
                                "SAMPLING_STAGE"
                            )}
                            {renderSelectWithSelectAll(
                                "matrixGroup",
                                t("MATRIX_GROUP"),
                                "More Info on Matrix Groups",
                                "MATRIX_GROUP"
                            )}
                            {renderSelectWithSelectAll(
                                "matrix",
                                t("MATRIX"),
                                "More Info on Matrices",
                                "MATRIX"
                            )}
                        </Stack>
                        <Box
                            mt={4}
                            display="flex"
                            justifyContent="center"
                            gap={2}
                        >
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                sx={{ minWidth: 120, background: "#003663" }}
                                onClick={() => handleSearch()}
                                disabled={loading}
                            >
                                {t("SEARCH")}
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ minWidth: 120, background: "#003663" }}
                                onClick={resetFilters}
                                disabled={loading}
                            >
                                {t("RESET FILTERS")}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
                {/* MAIN CONTENT */}
                <Box flex={1} ml="370px" px={4} py={3}>
                    {renderSubstanceFilter()}
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 2 }}
                    >
                        <FormControl sx={{ width: SELECT_WIDTH }}>
                            <InputLabel>{t("combinations")}</InputLabel>
                            <Select
                                multiple
                                value={selectedCombinations}
                                onChange={(e) => {
                                    const v = e.target.value as string[];
                                    if (v.includes("all")) {
                                        setSelectedCombinations(
                                            selectedCombinations.length ===
                                                availableCombinations.length
                                                ? []
                                                : availableCombinations.slice(
                                                      0,
                                                      4
                                                  )
                                        );
                                    } else if (v.length > 4) {
                                        setMaxComboDialogOpen(true);
                                    } else {
                                        setSelectedCombinations(v);
                                    }
                                }}
                                renderValue={(selectedValues) =>
                                    (selectedValues as string[]).join(", ")
                                }
                                MenuProps={fixedMenuProps}
                                label={t("combinations")}
                                sx={selectSx}
                            >
                                <MenuItem value="all">
                                    <Checkbox
                                        checked={
                                            selectedCombinations.length ===
                                            availableCombinations.length
                                        }
                                        indeterminate={
                                            selectedCombinations.length > 0 &&
                                            selectedCombinations.length <
                                                availableCombinations.length
                                        }
                                    />
                                    <ListItemText
                                        primary={
                                            selectedCombinations.length ===
                                            availableCombinations.length
                                                ? t("DESELECT_ALL") ||
                                                  "Deselect All"
                                                : t("SELECT_ALL") ||
                                                  "Select All"
                                        }
                                    />
                                </MenuItem>

                                {availableCombinations.length === 0 ? (
                                    <MenuItem disabled value="">
                                        {t("No options")}
                                    </MenuItem>
                                ) : (
                                    availableCombinations.map((key) => (
                                        <MenuItem key={key} value={key}>
                                            <Checkbox
                                                checked={selectedCombinations.includes(
                                                    key
                                                )}
                                            />
                                            <ListItemText primary={key} />
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        {/* Info button for combinations */}
                        <Tooltip title={t("More Info on Combinations")}>
                            <IconButton
                                size="small"
                                onClick={() => handleInfoClick("combinations")}
                                sx={{ ml: 0.5 }}
                            >
                                <InfoIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    {/* Show results if available */}
                    {showResults && (
                        <Box mt={2} mb={2}>
                            {filteredFullData.length > 0 && chartYear ? (
                                <>
                                    {renderChartYearDropdown()}
                                    <SubstanceChart
                                        data={filteredFullData}
                                        microorganism={microorganism}
                                        year={chartYear}
                                        selectedCombinations={
                                            selectedCombinations
                                        }
                                    />
                                </>
                            ) : (
                                <Typography sx={{ mt: 3, fontStyle: "italic" }}>
                                    {t("No data for selected filters.")}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* ----------- ALWAYS SHOW SUBSTANCE INFO BELOW ----------- */}
                    {substanceInfoLoading && (
                        <Box mt={3} display="flex" justifyContent="center">
                            <Typography variant="body2" color="textSecondary">
                                {t("Loading substance information...")}
                            </Typography>
                        </Box>
                    )}
                    {substanceInfoError && (
                        <Box mt={3} display="flex" justifyContent="center">
                            <Typography variant="body2" color="error">
                                {substanceInfoError}
                            </Typography>
                        </Box>
                    )}
                    {substanceInfo && (
                        <Box
                            mt={3}
                            mb={3}
                            p={3}
                            bgcolor="#f6f7fa"
                            borderRadius={2}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: "#003663" }}
                            >
                                {substanceInfo.title}
                            </Typography>
                            <Markdown options={{ forceBlock: true }}>
                                {substanceInfo.description}
                            </Markdown>
                        </Box>
                    )}
                </Box>

                <Dialog open={infoDialogOpen} onClose={handleClose}>
                    <DialogTitle>{infoDialogTitle}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <Markdown>{infoDialogContent}</Markdown>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Close</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={maxComboDialogOpen}
                    onClose={() => setMaxComboDialogOpen(false)}
                >
                    <DialogTitle>{t("combination_limit_title")}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {t("combination_limit_message")}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setMaxComboDialogOpen(false)}>
                            {t("ok")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};
