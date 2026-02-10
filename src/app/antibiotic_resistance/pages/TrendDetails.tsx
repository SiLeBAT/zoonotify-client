import React, { useState, useEffect, useRef } from "react";
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Alert,
    Grid,
    Checkbox,
    ListItemText,
    Pagination,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse } from "../../shared/model/CMS.model";
import i18next from "i18next";
import { FormattedMicroorganismName } from "./AntibioticResistancePage.component";
import {
    INFORMATION,
    TREND_INFORMATION,
    RESISTANCES,
} from "../../shared/infrastructure/router/routes";
import Markdown from "markdown-to-jsx";
import type { MenuProps } from "@mui/material/Menu";
import { SidebarComponent } from "../../shared/components/layout/SidebarComponent";

import { TrendChart } from "./TrendChart";
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
    documentId: string; // shared cross-language!
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

/** Get the relation object for a given filter key from a data item */
function getRelObjectTrend(
    item: ResistanceApiItem,
    key: FilterKey
): { name: string; documentId: string } | null {
    switch (key) {
        case "specie":
            return item.specie ?? null;
        case "superCategorySampleOrigin":
            return item.superCategorySampleOrigin ?? null;
        case "sampleOrigin":
            return item.sampleOrigin ?? null;
        case "samplingStage":
            return item.samplingStage ?? null;
        case "matrixGroup":
            return item.matrixGroup ?? null;
        case "matrix":
            return item.matrix ?? null;
        case "antimicrobialSubstance":
            return item.antimicrobialSubstance ?? null;
        default:
            return null;
    }
}

/** Build docId->name and name->docId maps for all filter keys */
function buildDocIdToNameMapTrend(
    items: ResistanceApiItem[]
): Record<FilterKey, Map<string, string>> {
    const result = {} as Record<FilterKey, Map<string, string>>;
    const keys: FilterKey[] = [
        "specie",
        "superCategorySampleOrigin",
        "sampleOrigin",
        "samplingStage",
        "matrixGroup",
        "matrix",
        "antimicrobialSubstance",
    ];
    for (const k of keys) {
        const m = new Map<string, string>();
        for (const item of items) {
            const obj = getRelObjectTrend(item, k);
            if (obj?.documentId && obj?.name) m.set(obj.documentId, obj.name);
        }
        result[k] = m;
    }
    result.samplingYear = new Map<string, string>();
    return result;
}

function buildNameToDocIdMapTrend(
    items: ResistanceApiItem[]
): Record<FilterKey, Map<string, string>> {
    const result = {} as Record<FilterKey, Map<string, string>>;
    const keys: FilterKey[] = [
        "specie",
        "superCategorySampleOrigin",
        "sampleOrigin",
        "samplingStage",
        "matrixGroup",
        "matrix",
        "antimicrobialSubstance",
    ];
    for (const k of keys) {
        const m = new Map<string, string>();
        for (const item of items) {
            const obj = getRelObjectTrend(item, k);
            if (obj?.name && obj?.documentId) m.set(obj.name, obj.documentId);
        }
        result[k] = m;
    }
    result.samplingYear = new Map<string, string>();
    return result;
}

/** Resolve a URL value (name or old docId) to docId with backwards compat */
function resolveUrlValueToDocIdTrend(
    value: string,
    nameToDocId: Map<string, string>,
    docIdToName: Map<string, string>
): string | undefined {
    const byName = nameToDocId.get(value);
    if (byName) return byName;
    if (docIdToName.has(value)) return value;
    return undefined;
}

function updateTrendFilterUrl(
    microorganism: string,
    selected: Record<FilterKey, string[]>,
    substanceFilter: string[],
    dataItems?: ResistanceApiItem[]
): void {
    const params = new URLSearchParams(window.location.search);
    params.set("microorganism", microorganism);

    // Build docId->name map for converting filter values to names
    const docIdToName = dataItems
        ? buildDocIdToNameMapTrend(dataItems)
        : ({} as Record<FilterKey, Map<string, string>>);

    Object.entries(selected).forEach(([key, arr]) => {
        if (arr.length) {
            const k = key as FilterKey;
            if (k === "samplingYear" || !docIdToName[k]) {
                params.set(key, arr.join(","));
            } else {
                // Convert docIds to names for URL stability
                params.set(
                    key,
                    arr
                        .map((docId) => docIdToName[k].get(docId) ?? docId)
                        .join(",")
                );
            }
        } else {
            params.delete(key);
        }
    });
    if (substanceFilter.length) {
        const subMap = docIdToName.antimicrobialSubstance;
        params.set(
            "antimicrobialSubstance",
            subMap
                ? substanceFilter
                      .map((docId) => subMap.get(docId) ?? docId)
                      .join(",")
                : substanceFilter.join(",")
        );
    } else {
        params.delete("antimicrobialSubstance");
    }

    params.set("view", "trend");
    params.set("lang", i18next.language);

    window.history.replaceState(null, "", `?${params.toString()}`);
}

// Read state from URL (names or old docIds -> resolve to docIds)
function readTrendFilterStateFromUrl(
    allSubstances: FilterOption[],
    dataItems?: ResistanceApiItem[]
): {
    selected: Record<FilterKey, string[]>;
    substanceFilter: string[];
} {
    const params = new URLSearchParams(window.location.search);
    const result: Record<FilterKey, string[]> = { ...emptyFilterState };

    // Build resolution maps from data
    const nameToDocId = dataItems
        ? buildNameToDocIdMapTrend(dataItems)
        : ({} as Record<FilterKey, Map<string, string>>);
    const docIdToNameMap = dataItems
        ? buildDocIdToNameMapTrend(dataItems)
        : ({} as Record<FilterKey, Map<string, string>>);

    /** Resolve a list of URL values (names or old docIds) to docIds */
    const resolveList = (key: FilterKey, values: string[]): string[] => {
        if (key === "samplingYear" || !nameToDocId[key]) return values;
        return values
            .map((v) =>
                resolveUrlValueToDocIdTrend(
                    v,
                    nameToDocId[key],
                    docIdToNameMap[key]
                )
            )
            .filter((v): v is string => v !== undefined);
    };

    (Object.keys(emptyFilterState) as FilterKey[]).forEach((key) => {
        const val = params.get(key);
        const rawValues = val ? val.split(",").filter((v) => v) : [];
        result[key] = resolveList(key, rawValues);
    });

    const substanceParam = params.get("antimicrobialSubstance");
    let substanceFilter = substanceParam
        ? resolveList(
              "antimicrobialSubstance",
              substanceParam.split(",").filter((v) => v)
          )
        : [];
    if (substanceParam === null)
        substanceFilter = allSubstances.map((s) => s.documentId); // default all
    return { selected: result, substanceFilter };
}

// Map filter key -> stable documentId value
function getDocId(entry: ResistanceApiItem, key: FilterKey): string {
    switch (key) {
        case "samplingYear":
            return entry.samplingYear != null ? String(entry.samplingYear) : "";
        case "specie":
            return entry.specie?.documentId ?? "";
        case "superCategorySampleOrigin":
            return entry.superCategorySampleOrigin?.documentId ?? "";
        case "sampleOrigin":
            return entry.sampleOrigin?.documentId ?? "";
        case "samplingStage":
            return entry.samplingStage?.documentId ?? "";
        case "matrixGroup":
            return entry.matrixGroup?.documentId ?? "";
        case "matrix":
            return entry.matrix?.documentId ?? "";
        case "antimicrobialSubstance":
            return entry.antimicrobialSubstance?.documentId ?? "";
    }
}

// Map filter key -> display name
function getName(entry: ResistanceApiItem, key: FilterKey): string {
    switch (key) {
        case "samplingYear":
            return entry.samplingYear != null ? String(entry.samplingYear) : "";
        case "specie":
            return entry.specie?.name ?? "";
        case "superCategorySampleOrigin":
            return entry.superCategorySampleOrigin?.name ?? "";
        case "sampleOrigin":
            return entry.sampleOrigin?.name ?? "";
        case "samplingStage":
            return entry.samplingStage?.name ?? "";
        case "matrixGroup":
            return entry.matrixGroup?.name ?? "";
        case "matrix":
            return entry.matrix?.name ?? "";
        case "antimicrobialSubstance":
            return entry.antimicrobialSubstance?.name ?? "";
    }
}

function shouldShowSpeciesFilter(microorganism: string): boolean {
    return (
        microorganism === "Campylobacter spp." ||
        microorganism === "Enterococcus spp."
    );
}

function getGroupKey(r: ResistanceApiItem): string {
    if (r.specie && r.specie.name) {
        return `${r.specie.name}|||${r.matrix?.name || "No matrix"}|||${
            r.sampleOrigin?.name || "No sample origin"
        }|||${r.samplingStage?.name || "No sampling stage"}`;
    }
    return `|||${r.matrix?.name || "No matrix"}|||${
        r.sampleOrigin?.name || "No sample origin"
    }|||${r.samplingStage?.name || "No sampling stage"}`;
}

function renderGroupLabel(
    key: string,
    t: (key: string) => string
): React.ReactNode {
    const [specie, matrix, sampleOrigin, samplingStage] = key.split("|||");
    return (
        <>
            {specie && (
                <>
                    {t("SPECIES")}:{" "}
                    <FormattedMicroorganismName
                        microName={specie}
                        fontWeight="bold"
                        fontSize="1.3rem"
                    />
                    {", "}
                </>
            )}
            {t("MATRIX")}: {matrix}, {t("SAMPLE_ORIGIN")}: {sampleOrigin},{" "}
            {t("SAMPLING_STAGE")}: {samplingStage}
        </>
    );
}

const CHARTS_PER_PAGE = 2;

const SELECT_WIDTH = 760;

const selectSx = {
    width: SELECT_WIDTH,
    "& .MuiSelect-select": {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
};

// keep the menu the same width and anchored consistently
const fixedMenuProps: Partial<MenuProps> = {
    PaperProps: {
        sx: { minWidth: SELECT_WIDTH },
        style: { maxHeight: 400 },
    },
    anchorOrigin: { vertical: "bottom", horizontal: "left" },
    transformOrigin: { vertical: "top", horizontal: "left" },
};

export const TrendDetails: React.FC<{
    microorganism: string;
    breadcrumb?: React.ReactNode;
}> = ({ microorganism, breadcrumb }) => {
    const { t } = useTranslation(["Antibiotic"]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const hydratedFromUrlRef = useRef(false);

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
    const [showChart, setShowChart] = useState(false);

    const [substanceFilter, setSubstanceFilter] = useState<string[]>([]);

    const [allSubstances, setAllSubstances] = useState<FilterOption[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [infoDialogTitle, setInfoDialogTitle] = useState("");
    const [infoDialogContent, setInfoDialogContent] = useState("");
    const [trendInfo, setTrendInfo] = useState<{
        title: string;
        description: string;
    } | null>(null);
    const [trendInfoLoading, setTrendInfoLoading] = useState(false);
    const [trendInfoError, setTrendInfoError] = useState<string | null>(null);

    const menuItemTextStyle = `.menu-item-text-wrap {
            white-space: normal !important;
            word-break: break-word !important;
            max-width: 260px;
            display: block;
        }`;

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

    useEffect(() => {
        async function fetchTrendInfo(): Promise<void> {
            setTrendInfoLoading(true);
            setTrendInfoError(null);
            try {
                const url = `${TREND_INFORMATION}?locale=${i18next.language}`;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = await callApiService<any>(url);
                if (response?.data?.data) {
                    setTrendInfo({
                        title: response.data.data.title,
                        description: response.data.data.description,
                    });
                } else {
                    setTrendInfo(null);
                }
            } catch (err) {
                setTrendInfoError("Failed to load trend information.");
                setTrendInfo(null);
            } finally {
                setTrendInfoLoading(false);
            }
        }
        fetchTrendInfo();
    }, [i18next.language]);

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

            if (!hydratedFromUrlRef.current) {
                setShowChart(false);
            }
        }
    }, [i18next.language, microorganism]);

    // Set options for all filters (use documentId as key for all)
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

        // Only default substanceFilter on first load (before URL hydration)
        if (!hydratedFromUrlRef.current) {
            setSubstanceFilter(antimicrobialSubstance.map((a) => a.documentId)); // default all
        }
    }, [resistanceRawData]);

    // Hydrate from URL ONCE on initial load
    useEffect(() => {
        if (hydratedFromUrlRef.current) return;
        if (allSubstances.length === 0) return;

        const { selected: urlSelected, substanceFilter: urlSubstanceFilter } =
            readTrendFilterStateFromUrl(allSubstances, resistanceRawData);
        setSelected(urlSelected);
        setSubstanceFilter(urlSubstanceFilter);
        hydratedFromUrlRef.current = true;
    }, [microorganism, allSubstances]);

    // Filtering logic (always by documentId)
    const filterDataWithSelected = (): ResistanceApiItem[] => {
        let result = resistanceRawData;
        if (selected.samplingYear.length)
            result = result.filter((r) =>
                selected.samplingYear.includes(String(r.samplingYear))
            );
        if (selected.specie.length)
            result = result.filter(
                (r) => r.specie && selected.specie.includes(r.specie.documentId)
            );
        if (selected.superCategorySampleOrigin.length)
            result = result.filter(
                (r) =>
                    r.superCategorySampleOrigin &&
                    selected.superCategorySampleOrigin.includes(
                        r.superCategorySampleOrigin.documentId
                    )
            );
        if (selected.sampleOrigin.length)
            result = result.filter(
                (r) =>
                    r.sampleOrigin &&
                    selected.sampleOrigin.includes(r.sampleOrigin.documentId)
            );
        if (selected.samplingStage.length)
            result = result.filter(
                (r) =>
                    r.samplingStage &&
                    selected.samplingStage.includes(r.samplingStage.documentId)
            );
        if (selected.matrixGroup.length)
            result = result.filter(
                (r) =>
                    r.matrixGroup &&
                    selected.matrixGroup.includes(r.matrixGroup.documentId)
            );
        if (selected.matrix.length)
            result = result.filter(
                (r) => r.matrix && selected.matrix.includes(r.matrix.documentId)
            );
        if (substanceFilter.length)
            result = result.filter(
                (r) =>
                    r.antimicrobialSubstance &&
                    substanceFilter.includes(
                        r.antimicrobialSubstance.documentId
                    )
            );
        return result;
    };

    // On language change (after hydration): recompute filtered data + update URL with new names
    useEffect(() => {
        if (!hydratedFromUrlRef.current) return;
        if (!resistanceRawData.length) return;

        // Recompute filtered data with new-language data so cascading options update
        if (showChart) {
            setFilteredFullData(filterDataWithSelected());
        }

        updateTrendFilterUrl(
            microorganism,
            selected,
            substanceFilter,
            resistanceRawData
        );
    }, [resistanceRawData]);

    // === Cascading option recomputation (like Substance) ===
    useEffect(() => {
        // Source dataset: before Search -> full; after Search -> filtered
        const dataToCompute: ResistanceApiItem[] = showChart
            ? filteredFullData
            : resistanceRawData;

        // Keys to respect when filtering
        const keys: FilterKey[] = [
            "samplingYear",
            "specie",
            "superCategorySampleOrigin",
            "sampleOrigin",
            "samplingStage",
            "matrixGroup",
            "matrix",
            "antimicrobialSubstance",
        ];

        // Respect all current selections except the one we recompute
        const filterRespectingSelections = (
            entry: ResistanceApiItem,
            excludeKey: FilterKey
        ): boolean => {
            for (const k of keys) {
                if (k === excludeKey) continue;
                const sel = selected[k] ?? [];
                if (sel.length === 0) continue;
                const v = getDocId(entry, k);
                if (!v || !sel.includes(v)) return false;
            }
            return true;
        };

        // Build sorted, unique options from current data slice
        const computeOptions = (key: FilterKey): FilterOption[] => {
            const map = new Map<string, { id: string; name: string }>();
            for (const e of dataToCompute) {
                if (!filterRespectingSelections(e, key)) continue;
                const documentId = getDocId(e, key);
                const name = getName(e, key);
                if (documentId && name && !map.has(documentId)) {
                    map.set(documentId, { id: documentId, name });
                }
            }
            return Array.from(map.entries())
                .map(([documentId, { id, name }]) => ({ id, name, documentId }))
                .sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, {
                        numeric: true,
                        sensitivity: "base",
                    })
                );
        };

        // Recompute all dropdowns (you already hide antimicrobialSubstance in the sidebar renderer)
        const next: Record<FilterKey, FilterOption[]> = {
            samplingYear: computeOptions("samplingYear"),
            specie: computeOptions("specie"),
            superCategorySampleOrigin: computeOptions(
                "superCategorySampleOrigin"
            ),
            sampleOrigin: computeOptions("sampleOrigin"),
            samplingStage: computeOptions("samplingStage"),
            matrixGroup: computeOptions("matrixGroup"),
            matrix: computeOptions("matrix"),
            antimicrobialSubstance: computeOptions("antimicrobialSubstance"),
        };

        setFilterOptions(next);

        // ----- Prune invalid selections ONLY IF changed (prevents update loops)
        type SelectedState = Record<FilterKey, string[]>;
        const arrEq = (a: string[], b: string[]): boolean =>
            a.length === b.length && a.every((v, i) => v === b[i]);

        const prune = (key: FilterKey, current: string[]): string[] => {
            const valid = new Set((next[key] ?? []).map((o) => o.documentId));
            // keep original order
            return current.filter((v) => valid.has(v));
        };

        setSelected((prev: SelectedState): SelectedState => {
            let changed = false;
            const upd: SelectedState = { ...prev };
            for (const k of keys) {
                const pruned = prune(k, prev[k]);
                if (!arrEq(pruned, prev[k])) {
                    upd[k] = pruned;
                    changed = true;
                }
            }
            return changed ? upd : prev; // critical to avoid infinite re-running
        });

        // Also prune top "Antibiotic Substance" selection, guarded
        setSubstanceFilter((prev: string[]): string[] => {
            const valid = new Set(
                next.antimicrobialSubstance.map((o) => o.documentId)
            );
            const pruned = prev.filter((v) => valid.has(v));
            return arrEq(pruned, prev) ? prev : pruned;
        });

        // Optional: if you want the top dropdown OPTIONS to also shrink,
        // uncomment the next line:
        // setAllSubstances(next.antimicrobialSubstance);
    }, [selected, showChart, resistanceRawData, filteredFullData]);

    // Only update when search button pressed or substanceFilter changes
    const handleSearch = (): void => {
        setFilteredFullData(filterDataWithSelected());
        setShowChart(true);
        setCurrentPage(1);
        updateTrendFilterUrl(
            microorganism,
            selected,
            substanceFilter,
            resistanceRawData
        );
    };

    useEffect(() => {
        setFilteredFullData(filterDataWithSelected());
        setShowChart(true);
        //setCurrentPage(1);
    }, [substanceFilter]);

    const resetFilters = (): void => {
        setSelected({ ...emptyFilterState });
        setShowChart(false);
        setSubstanceFilter(allSubstances.map((a) => a.documentId));
        updateTrendFilterUrl(
            microorganism,
            { ...emptyFilterState },
            allSubstances.map((a) => a.documentId),
            resistanceRawData
        );
    };

    // Info dialog logic unchanged
    const handleInfoClick = async (categoryKey: string): Promise<void> => {
        const translatedCategory = t(categoryKey);
        try {
            const url = `${INFORMATION}?filters[title][$eq]=${encodeURIComponent(
                translatedCategory
            )}&locale=${i18next.language}&pagination[pageSize]=1`;
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
            setSubstanceFilter(newSubstanceFilter);
            updateTrendFilterUrl(
                microorganism,
                selected,
                newSubstanceFilter,
                resistanceRawData
            );
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
                        sx={selectSx}
                        MenuProps={fixedMenuProps}
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
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
        );
    }

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

    // Grouping & rendering
    const grouped = filteredFullData.reduce((acc, item) => {
        const key = getGroupKey(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, ResistanceApiItem[]>);

    const groupEntries = Object.entries(grouped);
    groupEntries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    const totalCharts = groupEntries.length;
    const totalPages = Math.ceil(totalCharts / CHARTS_PER_PAGE);
    const paginatedGroups = groupEntries.slice(
        (currentPage - 1) * CHARTS_PER_PAGE,
        currentPage * CHARTS_PER_PAGE
    );

    return (
        <>
            <style>{menuItemTextStyle}</style>
            <Box
                display="flex"
                flexDirection="row"
                sx={{ width: "100%", height: "calc(100vh - 75px)" }}
            >
                {/* SIDEBAR */}
                <SidebarComponent
                    isOpen={isSidebarOpen}
                    handleOpenClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    title={t("Search options")}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            overflowY: "auto",
                            p: 3,
                            width: "380px",
                            maxWidth: "95%",
                            height: "calc(100vh - 150px)",
                        }}
                    >
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
                                onClick={handleSearch}
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
                </SidebarComponent>
                {/* MAIN CONTENT */}
                <Box
                    flex={1}
                    px={4}
                    py={3}
                    sx={{
                        overflow: "auto",
                        boxShadow: "15px 0 15px -15px rgba(0,0,0,0.15) inset",
                        backgroundColor: "#fff",
                        marginLeft: "20px",
                    }}
                >
                    {breadcrumb}
                    {renderSubstanceFilter()}

                    {/* Show charts if available */}
                    {showChart && paginatedGroups.length > 0 && (
                        <Box mt={2} mb={2}>
                            <Grid container spacing={4}>
                                {paginatedGroups.map(
                                    ([groupKey, groupItems]) => {
                                        const chartData = groupItems
                                            .map((r) => ({
                                                samplingYear: r.samplingYear,
                                                resistenzrate: r.resistenzrate,
                                                antimicrobialSubstance:
                                                    r.antimicrobialSubstance
                                                        ?.name ?? "",
                                                anzahlGetesteterIsolate:
                                                    r.anzahlGetesteterIsolate,
                                            }))
                                            .filter(
                                                (d) =>
                                                    !!d.antimicrobialSubstance
                                            );
                                        return (
                                            <Grid
                                                item
                                                xs={12}
                                                sm={12}
                                                md={12}
                                                lg={12}
                                                xl={6}
                                                key={groupKey}
                                            >
                                                <Box mb={5}>
                                                    <TrendChart
                                                        data={chartData}
                                                        microorganism={
                                                            microorganism
                                                        }
                                                        fullData={groupItems}
                                                        groupLabel={renderGroupLabel(
                                                            groupKey,
                                                            t
                                                        )}
                                                    />
                                                </Box>
                                            </Grid>
                                        );
                                    }
                                )}
                            </Grid>
                            {totalPages > 1 && (
                                <Box
                                    mt={4}
                                    display="flex"
                                    justifyContent="center"
                                >
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={(_, value) =>
                                            setCurrentPage(value)
                                        }
                                        color="primary"
                                        size="large"
                                    />
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* ----------- ALWAYS SHOW TREND INFO BELOW ----------- */}
                    {trendInfoLoading && (
                        <Box mt={3} display="flex" justifyContent="center">
                            <Typography variant="body2" color="textSecondary">
                                Loading trend information...
                            </Typography>
                        </Box>
                    )}
                    {trendInfoError && (
                        <Box mt={3} display="flex" justifyContent="center">
                            <Typography variant="body2" color="error">
                                {trendInfoError}
                            </Typography>
                        </Box>
                    )}
                    {trendInfo && (
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
                                {trendInfo.title}
                            </Typography>
                            <Markdown options={{ forceBlock: true }}>
                                {trendInfo.description}
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
            </Box>
        </>
    );
};
