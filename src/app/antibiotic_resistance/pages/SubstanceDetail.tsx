import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
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
    Checkbox,
    ListItemText,
} from "@mui/material";
import type { MenuProps } from "@mui/material/Menu";
import type { SelectChangeEvent } from "@mui/material/Select";

import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";

import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse } from "../../shared/model/CMS.model";
import { getGroupKey, SubstanceChart } from "./SubstanceChart";
import LZString from "lz-string";
import {
    INFORMATION,
    RESISTANCES,
    SUBSTANCE_INFORMATION,
} from "../../shared/infrastructure/router/routes";
import Markdown from "markdown-to-jsx";
import { SidebarComponent } from "../../shared/components/layout/SidebarComponent";
import {
    type FilterKey,
    type FilterOption,
    type ResistanceApiItem,
    emptyFilterState,
    buildDocIdToNameMap,
    buildNameToDocIdMap,
    resolveUrlValueToDocId as resolveUrlValueToDocIdShared,
} from "./resistanceHelpers";

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

// ======== URL STATE HELPERS ========

type ShortKey = "y" | "a" | "s" | "u" | "o" | "g" | "mG" | "m";

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
    lang: string,
    chartYear?: number,
    combinations?: string[], // stable name-keys
    dataItems?: ResistanceApiItem[] //  for docId->name conversion
): string {
    // Build docId->name map for converting filter values to names
    const docIdToName = dataItems
        ? buildDocIdToNameMap(dataItems)
        : ({} as Record<FilterKey, Map<string, string>>);

    const f: Partial<Record<ShortKey, string[]>> = {};
    (Object.keys(selected) as FilterKey[]).forEach((k) => {
        const val = selected[k];
        if (val && val.length) {
            if (k === "samplingYear" || !docIdToName[k]) {
                f[LONG_TO_SHORT[k]] = val;
            } else {
                // Convert docIds to names for URL stability
                f[LONG_TO_SHORT[k]] = val.map(
                    (docId) => docIdToName[k].get(docId) ?? docId
                );
            }
        }
    });
    if (substanceFilter.length) {
        const subMap = docIdToName.antimicrobialSubstance;
        f[LONG_TO_SHORT.antimicrobialSubstance] = subMap
            ? substanceFilter.map((docId) => subMap.get(docId) ?? docId)
            : substanceFilter;
    }

    const payload: {
        m: string;
        v: "substance";
        l: string;
        f: Partial<Record<ShortKey, string[]>>;
        y?: number;
        c?: string[];
    } = { m: microorganism, v: "substance", l: lang, f };

    if (typeof chartYear === "number") payload.y = chartYear;
    if (combinations && combinations.length) payload.c = combinations;

    return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

function decodeStateFromParam(sParam: string | null): {
    microorganism?: string;
    lang?: string;
    selected: Record<FilterKey, string[]>;
    substanceFilter: string[];
    chartYear?: number;
    combinations: string[];
} | null {
    if (!sParam) return null;
    try {
        const json = LZString.decompressFromEncodedURIComponent(sParam);
        if (!json) return null;
        const { m, l, f, y, c } = JSON.parse(json) as {
            m?: string;
            l?: string;
            f?: Partial<Record<ShortKey, string[]>>;
            y?: number;
            c?: string[];
        };

        const selected: Record<FilterKey, string[]> = { ...emptyFilterState };
        (Object.keys(f || {}) as ShortKey[]).forEach((sk) => {
            const longKey = SHORT_MAP[sk];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (longKey) selected[longKey] = (f as any)[sk] || [];
        });

        const substanceFilter = selected.antimicrobialSubstance || [];
        const chartYear = typeof y === "number" ? y : undefined;
        const combinations = Array.isArray(c) ? c : [];

        return {
            microorganism: m,
            lang: l,
            selected,
            substanceFilter,
            chartYear,
            combinations,
        };
    } catch {
        return null;
    }
}

function readLangFromUrl(): string | undefined {
    const params = new URLSearchParams(window.location.search);
    const decoded = decodeStateFromParam(params.get("s"));
    if (decoded?.lang) return decoded.lang;
    const legacy = params.get("lang") || params.get("locale");
    return legacy || undefined;
}

function updateSubstanceFilterUrlCompressed(
    microorganism: string,
    selected: Record<FilterKey, string[]>,
    substanceFilter: string[],
    lang: string,
    chartYear?: number,
    combinations?: string[],
    dataItems?: ResistanceApiItem[]
): void {
    const s = encodeStateToParam(
        microorganism,
        selected,
        substanceFilter,
        lang,
        chartYear,
        combinations,
        dataItems
    );
    window.history.replaceState(null, "", `?s=${s}`);
}

function readStateFromUrlCompressed(
    allSubstances: FilterOption[],
    allYears: FilterOption[],
    microorganism: string,
    fallbackLang: string,
    dataItems?: ResistanceApiItem[] //  for name->docId resolution
): {
    selected: Record<FilterKey, string[]>;
    substanceFilter: string[];
    chartYear?: number;
    combinations: string[];
} {
    const params = new URLSearchParams(window.location.search);
    const decoded = decodeStateFromParam(params.get("s"));

    // Build resolution maps from data
    const nameToDocId = dataItems
        ? buildNameToDocIdMap(dataItems)
        : ({} as Record<FilterKey, Map<string, string>>);
    const docIdToNameMap = dataItems
        ? buildDocIdToNameMap(dataItems)
        : ({} as Record<FilterKey, Map<string, string>>);

    /** Resolve a list of URL values (names or old docIds) to docIds */
    const resolveList = (key: FilterKey, values: string[]): string[] => {
        if (key === "samplingYear" || !nameToDocId[key]) return values;
        return values
            .map((v) =>
                resolveUrlValueToDocIdShared(
                    v,
                    nameToDocId[key],
                    docIdToNameMap[key]
                )
            )
            .filter((v): v is string => v !== undefined);
    };

    if (decoded) {
        const selected = decoded.selected || { ...emptyFilterState };

        // Resolve names back to docIds for each filter key
        (Object.keys(selected) as FilterKey[]).forEach((k) => {
            selected[k] = resolveList(k, selected[k]);
        });

        if (!selected.samplingYear?.length) {
            selected.samplingYear = allYears.map((y) => y.documentId);
        }

        const rawSf = decoded.substanceFilter.length
            ? decoded.substanceFilter
            : allSubstances.map((s) => s.documentId);
        const sf = resolveList("antimicrobialSubstance", rawSf);

        return {
            selected,
            substanceFilter: sf.length
                ? sf
                : allSubstances.map((s) => s.documentId),
            chartYear: decoded.chartYear,
            combinations: decoded.combinations || [],
        };
    }

    // legacy query params support
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

    const sNew = encodeStateToParam(
        microorganism,
        legacySelected,
        legacySubstanceFilter,
        fallbackLang,
        undefined,
        undefined,
        dataItems
    );
    window.history.replaceState(null, "", `?s=${sNew}`);

    return {
        selected: legacySelected,
        substanceFilter: legacySubstanceFilter,
        chartYear: undefined,
        combinations: [],
    };
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

export const fixedMenuProps: Partial<MenuProps> = {
    PaperProps: {
        sx: { minWidth: SELECT_WIDTH },
        style: { maxHeight: 400 },
    },
    anchorOrigin: { vertical: "bottom", horizontal: "left" },
    transformOrigin: { vertical: "top", horizontal: "left" },
};

// ======================= COMBINATION STABLE KEY =============================
//  Stable key from documentIds (language-independent, survives locale switches)
function getComboIdKey(
    entry: ResistanceApiItem,
    microorganism: string
): string {
    const parts: string[] = [];

    // include species for only those microorganisms where it's relevant/visible
    if (shouldShowSpeciesFilter(microorganism)) {
        parts.push(entry.specie?.documentId ?? "-");
    }

    parts.push(entry.superCategorySampleOrigin?.documentId ?? "-");
    parts.push(entry.sampleOrigin?.documentId ?? "-");
    parts.push(entry.samplingStage?.documentId ?? "-");
    parts.push(entry.matrixGroup?.documentId ?? "-");
    parts.push(entry.matrix?.documentId ?? "-");

    return parts.join("|");
}

// ======================= WATERFALL HELPERS =============================

function uniqueFromItems(
    items: ResistanceApiItem[],
    key: FilterKey
): FilterOption[] {
    if (key === "samplingYear") {
        const years = Array.from(
            new Set(
                items
                    .map((i) => i.samplingYear)
                    .filter(Boolean)
                    .map(String)
            )
        ).sort();
        return years.map((y) => ({ id: y, name: y, documentId: y }));
    }

    const map = new Map<string, { id: string; name: string }>();

    for (const row of items) {
        const obj =
            key === "specie"
                ? row.specie
                : key === "superCategorySampleOrigin"
                ? row.superCategorySampleOrigin
                : key === "sampleOrigin"
                ? row.sampleOrigin
                : key === "samplingStage"
                ? row.samplingStage
                : key === "matrixGroup"
                ? row.matrixGroup
                : key === "matrix"
                ? row.matrix
                : key === "antimicrobialSubstance"
                ? row.antimicrobialSubstance
                : null;

        if (obj?.documentId && obj?.name && obj?.id !== undefined) {
            map.set(obj.documentId, { id: String(obj.id), name: obj.name });
        }
    }

    return Array.from(map.entries()).map(([documentId, v]) => ({
        id: v.id,
        name: v.name,
        documentId,
    }));
}

function filterDataExcludingKey(
    data: ResistanceApiItem[],
    sel: Record<FilterKey, string[]>,
    sub: string[],
    excludeKey: FilterKey
): ResistanceApiItem[] {
    let result = data;

    if (excludeKey !== "samplingYear" && sel.samplingYear.length) {
        result = result.filter((r) =>
            sel.samplingYear.includes(String(r.samplingYear))
        );
    }
    if (excludeKey !== "specie" && sel.specie.length) {
        result = result.filter(
            (r) => r.specie && sel.specie.includes(r.specie.documentId)
        );
    }
    if (
        excludeKey !== "superCategorySampleOrigin" &&
        sel.superCategorySampleOrigin.length
    ) {
        result = result.filter(
            (r) =>
                r.superCategorySampleOrigin &&
                sel.superCategorySampleOrigin.includes(
                    r.superCategorySampleOrigin.documentId
                )
        );
    }
    if (excludeKey !== "sampleOrigin" && sel.sampleOrigin.length) {
        result = result.filter(
            (r) =>
                r.sampleOrigin &&
                sel.sampleOrigin.includes(r.sampleOrigin.documentId)
        );
    }
    if (excludeKey !== "samplingStage" && sel.samplingStage.length) {
        result = result.filter(
            (r) =>
                r.samplingStage &&
                sel.samplingStage.includes(r.samplingStage.documentId)
        );
    }
    if (excludeKey !== "matrixGroup" && sel.matrixGroup.length) {
        result = result.filter(
            (r) =>
                r.matrixGroup &&
                sel.matrixGroup.includes(r.matrixGroup.documentId)
        );
    }
    if (excludeKey !== "matrix" && sel.matrix.length) {
        result = result.filter(
            (r) => r.matrix && sel.matrix.includes(r.matrix.documentId)
        );
    }

    // antimicrobialSubstance uses substanceFilter (sub)
    if (excludeKey !== "antimicrobialSubstance" && sub.length) {
        result = result.filter(
            (r) =>
                r.antimicrobialSubstance &&
                sub.includes(r.antimicrobialSubstance.documentId)
        );
    }

    return result;
}

// ======================= COMPONENT =============================

export const SubstanceDetail: React.FC<{
    microorganism: string;
    onShowMain: () => void;
    breadcrumb?: React.ReactNode;
}> = ({ microorganism, breadcrumb }) => {
    const { t, i18n } = useTranslation(["Antibiotic"]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    //  normalize locale for API: "de-DE" -> "de"
    const apiLocale = useMemo(() => {
        const base = (i18n.language || "en").split("-")[0].toLowerCase();
        return base.startsWith("de") ? "de" : "en";
    }, [i18n.language]);

    const langHydratedRef = useRef(false);
    const hydratedFromUrlRef = useRef(false);
    const prevMicroRef = useRef<string | null>(null);
    const keepEmptySubstanceAfterResetRef = useRef(false);

    const prevVisibleSubstanceIdsRef = useRef<string[] | null>(null);

    const [resistanceRawData, setResistanceRawData] = useState<
        ResistanceApiItem[]
    >([]);

    // NOTE: we still keep "all lists" for defaults + URL hydration
    const [allSubstances, setAllSubstances] = useState<FilterOption[]>([]);
    const [allYears, setAllYears] = useState<FilterOption[]>([]);

    const [selected, setSelected] = useState<Record<FilterKey, string[]>>({
        ...emptyFilterState,
    });
    const [filteredFullData, setFilteredFullData] = useState<
        ResistanceApiItem[]
    >([]);
    const [showResults, setShowResults] = useState(false);

    //  combinations are now STABLE ID KEYS
    const [availableCombinations, setAvailableCombinations] = useState<
        string[]
    >([]);
    const [selectedCombinations, setSelectedCombinations] = useState<string[]>(
        []
    );
    const [comboLabelMap, setComboLabelMap] = useState<Record<string, string>>(
        {}
    );
    const [nPerCombination, setNPerCombination] = useState<
        Record<string, number | undefined>
    >({});

    const [maxComboDialogOpen, setMaxComboDialogOpen] = useState(false);

    const [substanceFilter, setSubstanceFilter] = useState<string[]>([]);

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

    const [chartYear, setChartYear] = useState<number | undefined>(undefined);

    //  Apply language from URL once (use i18n, not i18next)
    useEffect(() => {
        if (langHydratedRef.current) return;
        langHydratedRef.current = true;

        const urlLang = readLangFromUrl();
        if (urlLang && urlLang !== apiLocale) {
            void i18n.changeLanguage(urlLang);
        }
    }, []);

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

    const handleSearch = useCallback(
        (
            sel = selected,
            sub = substanceFilter,
            overrideYear?: number
        ): void => {
            //  If user selected no substance, interpret it as "ALL visible substances"
            let effectiveSub = sub;

            if (effectiveSub.length === 0) {
                const visibleSubs = uniqueFromItems(
                    filterDataExcludingKey(
                        resistanceRawData,
                        sel,
                        sub,
                        "antimicrobialSubstance"
                    ),
                    "antimicrobialSubstance"
                );

                effectiveSub = visibleSubs.map((s) => s.documentId);

                //  update dropdown so UI matches the chart
                keepEmptySubstanceAfterResetRef.current = false;
                setSubstanceFilter(effectiveSub);
            }

            const filtered = filterDataWithSelected(sel, effectiveSub);
            setFilteredFullData(filtered);
            setShowResults(true);

            const years = Array.from(
                new Set(filtered.map((d) => d.samplingYear))
            ).sort((a, b) => b - a);

            const nextYear =
                typeof overrideYear === "number"
                    ? overrideYear
                    : years.length > 0
                    ? years[0]
                    : undefined;

            setChartYear(nextYear);

            updateSubstanceFilterUrlCompressed(
                microorganism,
                sel,
                effectiveSub,
                apiLocale,
                nextYear,
                selectedCombinations,
                resistanceRawData
            );
        },
        [
            filterDataWithSelected,
            microorganism,
            selected,
            substanceFilter,
            selectedCombinations,
            apiLocale,
            resistanceRawData,
        ]
    );

    //  REFETCH when language changes (apiLocale changes)
    useEffect(() => {
        let cancelled = false;

        async function fetchResistanceOptions(): Promise<void> {
            setLoading(true);
            setFetchError(null);

            try {
                const url =
                    `${RESISTANCES}?locale=${apiLocale}` +
                    `&filters[microorganism][name][$eq]=${encodeURIComponent(
                        microorganism
                    )}` +
                    `&populate=*&pagination[pageSize]=8000`;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const res = await callApiService<any>(url);

                if (!cancelled) setResistanceRawData(res.data?.data || []);
            } catch (err) {
                if (!cancelled) {
                    setFetchError(
                        "Failed to fetch filter options. Please try again."
                    );
                }
                console.error("Failed to fetch resistance options", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (!microorganism) return;

        const prevMicro = prevMicroRef.current;
        prevMicroRef.current = microorganism;

        if (prevMicro && prevMicro !== microorganism) {
            setShowResults(false);
            setFilteredFullData([]);
            setSelectedCombinations([]);
            setAvailableCombinations([]);
            setComboLabelMap({});
            setChartYear(undefined);
        }

        fetchResistanceOptions();

        return () => {
            cancelled = true;
        };
    }, [apiLocale, microorganism]);

    //  Build "ALL" lists (for defaults + URL hydration)
    useEffect(() => {
        const yearsAll = uniqueFromItems(resistanceRawData, "samplingYear");
        const subsAll = uniqueFromItems(
            resistanceRawData,
            "antimicrobialSubstance"
        );
        setAllYears(yearsAll);
        setAllSubstances(subsAll);
    }, [resistanceRawData]);

    //  IMPORTANT: If results were shown, after language refetch we re-run search
    useEffect(() => {
        if (!hydratedFromUrlRef.current) return;
        if (!showResults) return;
        handleSearch(selected, substanceFilter, chartYear);
    }, [resistanceRawData, apiLocale]);

    //  Hydrate from URL ONCE
    useEffect(() => {
        if (hydratedFromUrlRef.current) return;
        if (allSubstances.length === 0 || allYears.length === 0) return;

        const decoded = readStateFromUrlCompressed(
            allSubstances,
            allYears,
            microorganism,
            apiLocale,
            resistanceRawData
        );

        setSelected(decoded.selected);
        setSubstanceFilter(decoded.substanceFilter);

        if (typeof decoded.chartYear === "number")
            setChartYear(decoded.chartYear);
        if (decoded.combinations?.length)
            setSelectedCombinations(decoded.combinations);

        if (
            decoded.substanceFilter.length > 0 ||
            Object.values(decoded.selected).some((arr) => arr.length > 0) ||
            window.location.search.includes("view=substance")
        ) {
            handleSearch(
                decoded.selected,
                decoded.substanceFilter,
                decoded.chartYear
            );
        }

        hydratedFromUrlRef.current = true;
    }, [allSubstances, allYears, microorganism, handleSearch, apiLocale]);

    //  Fetch substance info localized
    useEffect(() => {
        let cancelled = false;

        async function fetchSubstanceInfo(): Promise<void> {
            setSubstanceInfoLoading(true);
            setSubstanceInfoError(null);
            try {
                const url = `${SUBSTANCE_INFORMATION}?locale=${apiLocale}`;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = await callApiService<any>(url);
                const data = response?.data?.data;

                if (!cancelled && data) {
                    const title = data.title ?? data.attributes?.title ?? "";
                    const description =
                        data.description ?? data.attributes?.description ?? "";
                    setSubstanceInfo({ title, description });
                }
            } catch {
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
    }, [apiLocale]);

    const resetFilters = (): void => {
        const resetSel = {
            ...emptyFilterState,
            samplingYear: allYears.map((a) => a.documentId),
        };
        const resetSubs: string[] = []; //  empty on reset
        keepEmptySubstanceAfterResetRef.current = true;

        setSelected(resetSel);
        setShowResults(false);
        setFilteredFullData([]);
        setSubstanceFilter(resetSubs);

        setChartYear(undefined);
        setSelectedCombinations([]);
        setAvailableCombinations([]);
        setComboLabelMap({});
        setNPerCombination({});

        updateSubstanceFilterUrlCompressed(
            microorganism,
            resetSel,
            resetSubs,
            apiLocale,
            undefined,
            [],
            resistanceRawData
        );
    };

    const handleInfoClick = async (categoryKey: string): Promise<void> => {
        const translatedCategory = t(categoryKey);
        try {
            const url = `${INFORMATION}?filters[title][$eq]=${encodeURIComponent(
                translatedCategory
            )}&locale=${apiLocale}&pagination[pageSize]=1`;

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

    //  WATERFALL prune selections when available options shrink
    useEffect(() => {
        if (!resistanceRawData.length) return;

        // prune non-substance filters
        setSelected((prev) => {
            let changed = false;
            const next = { ...prev };

            const keys: FilterKey[] = [
                "samplingYear",
                "specie",
                "superCategorySampleOrigin",
                "sampleOrigin",
                "samplingStage",
                "matrixGroup",
                "matrix",
            ];

            for (const k of keys) {
                const opts = uniqueFromItems(
                    filterDataExcludingKey(
                        resistanceRawData,
                        prev,
                        substanceFilter,
                        k
                    ),
                    k
                );
                const allowed = new Set(opts.map((o) => o.documentId));
                const pruned = prev[k].filter((id) => allowed.has(id));
                if (pruned.length !== prev[k].length) {
                    changed = true;
                    next[k] = pruned;
                }
            }

            return changed ? next : prev;
        });

        // prune substanceFilter by visible substances (waterfall)
        const visibleSubs = uniqueFromItems(
            filterDataExcludingKey(
                resistanceRawData,
                selected,
                substanceFilter,
                "antimicrobialSubstance"
            ),
            "antimicrobialSubstance"
        );

        const visibleIds = visibleSubs.map((o) => o.documentId);
        const allowedSubs = new Set(visibleIds);

        // previous visible list (for detecting "Select All" mode)
        const prevVisibleIds = prevVisibleSubstanceIdsRef.current;
        const wasAllSelectedBefore =
            prevVisibleIds != null &&
            prevVisibleIds.length > 0 &&
            substanceFilter.length === prevVisibleIds.length &&
            substanceFilter.every((id) => prevVisibleIds.includes(id));

        let nextSubstanceFilter = substanceFilter.filter((id) =>
            allowedSubs.has(id)
        );

        //  If user had "all" selected before, keep "all" selected after options change
        if (wasAllSelectedBefore) {
            nextSubstanceFilter = visibleIds;
        }

        //  If nothing selected (edge-case), default to "all visible"
        if (
            nextSubstanceFilter.length === 0 &&
            visibleIds.length > 0 &&
            !keepEmptySubstanceAfterResetRef.current
        ) {
            nextSubstanceFilter = visibleIds;
        }

        if (
            nextSubstanceFilter.length !== substanceFilter.length ||
            nextSubstanceFilter.some((id, idx) => id !== substanceFilter[idx])
        ) {
            setSubstanceFilter(nextSubstanceFilter);
        }
    }, [resistanceRawData, selected, substanceFilter]);

    //  Compute combinations using stable keys + localized labels
    useEffect(() => {
        if (!filteredFullData.length || !chartYear) {
            setAvailableCombinations([]);
            setSelectedCombinations([]);
            setComboLabelMap({});
            setNPerCombination({});
            return;
        }

        const yearData = filteredFullData.filter(
            (d) => d.samplingYear === chartYear
        );

        const labelMap: Record<string, string> = {};
        const nMap: Record<string, number | undefined> = {};

        for (const row of yearData) {
            const idKey = getComboIdKey(row, microorganism);
            if (!labelMap[idKey]) {
                labelMap[idKey] = getGroupKey(row, microorganism); // localized label
                nMap[idKey] = row?.anzahlGetesteterIsolate ?? undefined;
            }
        }

        const idKeys = Object.keys(labelMap);
        setComboLabelMap(labelMap);
        setAvailableCombinations(idKeys);
        setNPerCombination(nMap);

        setSelectedCombinations((prev) => {
            const pruned = prev.filter((k) => idKeys.includes(k));
            if (pruned.length >= 1) return pruned;
            return idKeys.slice(0, 4);
        });
    }, [filteredFullData, microorganism, chartYear, apiLocale]);

    // available chart years
    const availableYears = Array.from(
        new Set(filteredFullData.map((d) => d.samplingYear))
    ).sort((a, b) => b - a);

    function renderChartYearDropdown(): JSX.Element | null {
        if (!availableYears.length) return null;
        return (
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 0 }}
            >
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>{t("SAMPLING_YEAR")}</InputLabel>
                    <Select
                        value={chartYear ?? ""}
                        label={t("SAMPLING_YEAR")}
                        onChange={(e) => {
                            const y = Number(e.target.value);
                            setChartYear(y);
                            updateSubstanceFilterUrlCompressed(
                                microorganism,
                                selected,
                                substanceFilter,
                                apiLocale,
                                y,
                                selectedCombinations,
                                resistanceRawData
                            );
                        }}
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

    // keep URL updated (store stable combo ids)
    useEffect(() => {
        if (!hydratedFromUrlRef.current) return;
        updateSubstanceFilterUrlCompressed(
            microorganism,
            selected,
            substanceFilter,
            apiLocale,
            chartYear,
            selectedCombinations,
            resistanceRawData
        );
    }, [
        selected,
        substanceFilter,
        microorganism,
        chartYear,
        selectedCombinations,
        apiLocale,
        resistanceRawData,
    ]);

    const renderCombinationMenuPrimary = (
        comboIdKey: string
    ): React.ReactNode => {
        const label = comboLabelMap[comboIdKey] ?? comboIdKey;
        const N = nPerCombination[comboIdKey];
        const notPlotted = typeof N === "number" && N < 10;

        const nText =
            N != null
                ? notPlotted
                    ? `N=${N}, ${t("data_not_plotted")}`
                    : `N=${N}`
                : "N=?";

        if (shouldShowSpeciesFilter(microorganism)) {
            const parts = label.split(" | ");
            const species = parts[0];
            const rest = parts.slice(1).join(" | ");
            return (
                <span>
                    <span style={{ fontStyle: "italic" }}>{species}</span>
                    {rest ? ` | ${rest}` : ""}
                    <span style={{ color: "#888", fontWeight: 400 }}>
                        {" "}
                        ({nText})
                    </span>
                </span>
            );
        }

        return (
            <span>
                {label}
                <span style={{ color: "#888", fontWeight: 400 }}>
                    {" "}
                    ({nText})
                </span>
            </span>
        );
    };

    function renderSubstanceFilter(): JSX.Element {
        //  WATERFALL options for substance (based on other filters)
        const substances = uniqueFromItems(
            filterDataExcludingKey(
                resistanceRawData,
                selected,
                substanceFilter,
                "antimicrobialSubstance"
            ),
            "antimicrobialSubstance"
        );

        const visibleIds = substances.map((s) => s.documentId);

        const allSelected =
            visibleIds.length > 0 &&
            substanceFilter.length === visibleIds.length &&
            visibleIds.every((id) => substanceFilter.includes(id));

        const someSelected = substanceFilter.length > 0 && !allSelected;

        const handleChange = (event: SelectChangeEvent<string[]>): void => {
            const v = event.target.value as string[];
            let newSubstanceFilter: string[];

            if (v.includes("all")) {
                newSubstanceFilter = allSelected ? [] : visibleIds;
            } else {
                // keep only allowed visible ids (safety)
                const allowed = new Set(visibleIds);
                newSubstanceFilter = v.filter((id) => allowed.has(id));
            }

            //  Like combinations: change state, update URL, but DO NOT auto-search
            keepEmptySubstanceAfterResetRef.current = false;
            setSubstanceFilter(newSubstanceFilter);

            //  Update chart immediately (same behavior as combinations)
            handleSearch(selected, newSubstanceFilter, chartYear);

            //  URL stays in sync
            updateSubstanceFilterUrlCompressed(
                microorganism,
                selected,
                newSubstanceFilter,
                apiLocale,
                chartYear,
                selectedCombinations,
                resistanceRawData
            );
        };

        return (
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 0 }}
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
                                      .map((o) => o.name)
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
                                        checked={substanceFilter.includes(
                                            item.documentId
                                        )}
                                    />
                                    <ListItemText primary={item.name} />
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

    function renderSelectWithSelectAll(
        key: FilterKey,
        label: string,
        infoKey: string,
        categoryKey: string
    ): JSX.Element {
        if (key === "antimicrobialSubstance") return <></>;

        // WATERFALL options: filter by all other selections except itself
        const options = uniqueFromItems(
            filterDataExcludingKey(
                resistanceRawData,
                selected,
                substanceFilter,
                key
            ),
            key
        );

        const value = selected[key];
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
                                      .map((o) => o.name)
                                      .join(", ")
                                : ""
                        }
                        MenuProps={{
                            PaperProps: { style: { maxHeight: 400 } },
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
                                                    {item.name}
                                                </span>
                                            ) : (
                                                item.name
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

    //  For chart: convert stable ids -> current localized labels (so chart file doesn't need changes)
    const selectedCombinationLabelsForChart = useMemo(() => {
        return selectedCombinations
            .map((idKey) => comboLabelMap[idKey])
            .filter(Boolean);
    }, [selectedCombinations, comboLabelMap]);

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
                    <Stack spacing={2} sx={{ mb: 2 }}>
                        {renderChartYearDropdown()}

                        <Stack direction="row" spacing={1} alignItems="center">
                            <FormControl sx={{ width: SELECT_WIDTH }}>
                                <InputLabel>{t("combinations")}</InputLabel>
                                <Select
                                    multiple
                                    value={selectedCombinations} //  stable ids
                                    onChange={(e) => {
                                        const v = e.target.value as string[];
                                        let nextCombos: string[] = v;

                                        if (v.includes("all")) {
                                            nextCombos =
                                                selectedCombinations.length ===
                                                availableCombinations.length
                                                    ? []
                                                    : availableCombinations.slice(
                                                          0,
                                                          4
                                                      );
                                            setSelectedCombinations(nextCombos);
                                        } else if (v.length > 4) {
                                            setMaxComboDialogOpen(true);
                                            return;
                                        } else {
                                            setSelectedCombinations(v);
                                        }

                                        updateSubstanceFilterUrlCompressed(
                                            microorganism,
                                            selected,
                                            substanceFilter,
                                            apiLocale,
                                            chartYear,
                                            nextCombos,
                                            resistanceRawData
                                        );
                                    }}
                                    renderValue={(selectedValues) =>
                                        (selectedValues as string[])
                                            .map(
                                                (idKey) =>
                                                    comboLabelMap[idKey] ??
                                                    idKey
                                            )
                                            .join(", ")
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
                                                selectedCombinations.length >
                                                    0 &&
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
                                        availableCombinations.map((idKey) => (
                                            <MenuItem key={idKey} value={idKey}>
                                                <Checkbox
                                                    checked={selectedCombinations.includes(
                                                        idKey
                                                    )}
                                                />
                                                <ListItemText
                                                    primary={renderCombinationMenuPrimary(
                                                        idKey
                                                    )}
                                                />
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>

                            <Tooltip title={t("More Info on Combinations")}>
                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        handleInfoClick("combinations")
                                    }
                                    sx={{ ml: 0.5 }}
                                >
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>

                        {renderSubstanceFilter()}
                    </Stack>

                    {showResults && (
                        <Box mt={2} mb={2}>
                            {filteredFullData.length > 0 && chartYear ? (
                                <SubstanceChart
                                    data={filteredFullData}
                                    microorganism={microorganism}
                                    year={chartYear}
                                    selectedCombinations={
                                        selectedCombinationLabelsForChart
                                    }
                                />
                            ) : (
                                <Typography sx={{ mt: 3, fontStyle: "italic" }}>
                                    {t("No data for selected filters.")}
                                </Typography>
                            )}
                        </Box>
                    )}

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
                        <Button onClick={handleClose}>
                            {t("CLOSE", "Close")}
                        </Button>
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
