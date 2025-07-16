import React, { useState, useEffect } from "react";
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

function updateTrendFilterUrl(
    microorganism: string,
    selected: Record<FilterKey, string[]>,
    substanceFilter: string[]
): void {
    const params = new URLSearchParams(window.location.search);
    params.set("microorganism", microorganism);

    Object.entries(selected).forEach(([key, arr]) => {
        if (arr.length) params.set(key, arr.join(","));
        else params.delete(key);
    });
    if (substanceFilter.length)
        params.set("antimicrobialSubstance", substanceFilter.join(","));
    else params.delete("antimicrobialSubstance");

    params.set("view", "trend");
    params.set("lang", i18next.language);

    window.history.replaceState(null, "", `?${params.toString()}`);
}

// Read state from URL (using documentId as key)
function readTrendFilterStateFromUrl(allSubstances: FilterOption[]): {
    selected: Record<FilterKey, string[]>;
    substanceFilter: string[];
} {
    const params = new URLSearchParams(window.location.search);
    const result: Record<FilterKey, string[]> = { ...emptyFilterState };
    (Object.keys(emptyFilterState) as FilterKey[]).forEach((key) => {
        const val = params.get(key);
        result[key] = val ? val.split(",").filter((v) => v) : [];
    });
    const substanceParam = params.get("antimicrobialSubstance");
    let substanceFilter = substanceParam
        ? substanceParam.split(",").filter((v) => v)
        : [];
    if (substanceParam === null)
        substanceFilter = allSubstances.map((s) => s.documentId); // default all
    return { selected: result, substanceFilter };
}

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
                    <FormattedMicroorganismName microName={specie} />
                    {", "}
                </>
            )}
            {t("MATRIX")}: {matrix}, {t("SAMPLE_ORIGIN")}: {sampleOrigin},{" "}
            {t("SAMPLING_STAGE")}: {samplingStage}
        </>
    );
}

const CHARTS_PER_PAGE = 2;

export const TrendDetails: React.FC<{
    microorganism: string;
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
    const [showChart, setShowChart] = useState(false);

    // For substances multi-select at top
    const [substanceFilter, setSubstanceFilter] = useState<string[]>([]);
    // To update available substance options
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
            setShowChart(false);
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
        setSubstanceFilter(antimicrobialSubstance.map((a) => a.documentId)); // default all
    }, [resistanceRawData]);

    // On URL or data change: read filter state from URL
    useEffect(() => {
        if (allSubstances.length > 0) {
            const {
                selected: urlSelected,
                substanceFilter: urlSubstanceFilter,
            } = readTrendFilterStateFromUrl(allSubstances);
            setSelected(urlSelected);
            setSubstanceFilter(urlSubstanceFilter);
        }
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

    // Only update when search button pressed or substanceFilter changes
    const handleSearch = (): void => {
        setFilteredFullData(filterDataWithSelected());
        setShowChart(true);
        setCurrentPage(1);
        updateTrendFilterUrl(microorganism, selected, substanceFilter);
    };

    useEffect(() => {
        setFilteredFullData(filterDataWithSelected());
        setShowChart(true);
        //setCurrentPage(1);
    }, [substanceFilter]);

    // RESET
    const resetFilters = (): void => {
        setSelected({ ...emptyFilterState });
        setShowChart(false);
        setSubstanceFilter(allSubstances.map((a) => a.documentId));
        updateTrendFilterUrl(
            microorganism,
            { ...emptyFilterState },
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
            updateTrendFilterUrl(microorganism, selected, newSubstanceFilter);
        };
        return (
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 3 }}
            >
                <FormControl sx={{ minWidth: 350 }}>
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
                            {renderSelectWithSelectAll(
                                "samplingYear",
                                t("SAMPLING_YEAR"),
                                "More Info on Sampling Year",
                                "SAMPLING_YEAR"
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
                </Paper>
                {/* MAIN CONTENT */}
                <Box flex={1} ml="370px" px={4} py={3}>
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
                                                md={6}
                                                key={groupKey}
                                            >
                                                <Box mb={5}>
                                                    <TrendChart
                                                        data={chartData}
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
