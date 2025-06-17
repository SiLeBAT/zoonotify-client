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
// import { FormattedMicroorganismName } from "./AntibioticResistancePage.component";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse } from "../../shared/model/CMS.model";
import i18next from "i18next";
import {
    INFORMATION,
    TREND_INFORMATION,
    RESISTANCES,
} from "../../shared/infrastructure/router/routes";
import Markdown from "markdown-to-jsx";
import { TrendChart } from "./TrendChart";
import type { SelectChangeEvent } from "@mui/material/Select";

export interface ResistanceApiItem {
    id: number;
    samplingYear: number;
    superCategorySampleOrigin?: { id: number; name: string } | null;
    sampleOrigin?: { id: number; name: string } | null;
    samplingStage?: { id: number; name: string } | null;
    matrixGroup?: { id: number; name: string } | null;
    matrix?: { id: number; name: string } | null;
    antimicrobialSubstance?: { id: number; name: string } | null;
    specie?: { id: number; name: string } | null;
    resistenzrate: number;
    anzahlGetesteterIsolate: number;
    anzahlResistenterIsolate: number;
    minKonfidenzintervall: number;
    maxKonfidenzintervall: number;
}

type FilterKey =
    | "samplingYear"
    | "antimicrobialSubstance"
    | "specie"
    | "superCategorySampleOrigin"
    | "sampleOrigin"
    | "samplingStage"
    | "matrixGroup"
    | "matrix";

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
        }`;
    }
    return `|||${r.matrix?.name || "No matrix"}|||${
        r.sampleOrigin?.name || "No sample origin"
    }`;
}

function getGroupLabel(key: string, t: (key: string) => string): string {
    const [specie, matrix, sampleOrigin] = key.split("|||");
    if (specie) {
        return `${t("SPECIES")}: ${specie}, ${t("MATRIX")}: ${matrix}, ${t(
            "SAMPLE_ORIGIN"
        )}: ${sampleOrigin}`;
    }
    return `${t("MATRIX")}: ${matrix}, ${t("SAMPLE_ORIGIN")}: ${sampleOrigin}`;
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
        Record<FilterKey, string[]>
    >({ ...emptyFilterState });
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
    const [allSubstances, setAllSubstances] = useState<string[]>([]);

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

    // Set options for all filters
    useEffect(() => {
        function computeAvailableOptions(
            raw: ResistanceApiItem[],
            currentSelected: typeof selected
        ): Record<FilterKey, string[]> {
            function filterData(exclude: FilterKey): ResistanceApiItem[] {
                return raw.filter((item) => {
                    return (
                        (exclude === "samplingYear" ||
                            !currentSelected.samplingYear.length ||
                            currentSelected.samplingYear.includes(
                                String(item.samplingYear)
                            )) &&
                        (exclude === "specie" ||
                            !currentSelected.specie.length ||
                            (item.specie &&
                                currentSelected.specie.includes(
                                    item.specie.name
                                ))) &&
                        (exclude === "superCategorySampleOrigin" ||
                            !currentSelected.superCategorySampleOrigin.length ||
                            (item.superCategorySampleOrigin &&
                                currentSelected.superCategorySampleOrigin.includes(
                                    item.superCategorySampleOrigin.name
                                ))) &&
                        (exclude === "sampleOrigin" ||
                            !currentSelected.sampleOrigin.length ||
                            (item.sampleOrigin &&
                                currentSelected.sampleOrigin.includes(
                                    item.sampleOrigin.name
                                ))) &&
                        (exclude === "samplingStage" ||
                            !currentSelected.samplingStage.length ||
                            (item.samplingStage &&
                                currentSelected.samplingStage.includes(
                                    item.samplingStage.name
                                ))) &&
                        (exclude === "matrixGroup" ||
                            !currentSelected.matrixGroup.length ||
                            (item.matrixGroup &&
                                currentSelected.matrixGroup.includes(
                                    item.matrixGroup.name
                                ))) &&
                        (exclude === "matrix" ||
                            !currentSelected.matrix.length ||
                            (item.matrix &&
                                currentSelected.matrix.includes(
                                    item.matrix.name
                                )))
                    );
                });
            }
            const result: Record<FilterKey, string[]> = {
                samplingYear: [],
                antimicrobialSubstance: [],
                specie: [],
                superCategorySampleOrigin: [],
                sampleOrigin: [],
                samplingStage: [],
                matrixGroup: [],
                matrix: [],
            };
            for (const key of Object.keys(result) as FilterKey[]) {
                const filtered = filterData(key);
                let values: string[] = [];
                switch (key) {
                    case "samplingYear":
                        values = Array.from(
                            new Set(
                                filtered
                                    .map((i) => i.samplingYear)
                                    .filter(Boolean)
                                    .map(String)
                            )
                        ).sort();
                        break;
                    case "specie":
                        values = Array.from(
                            new Set(
                                filtered
                                    .map((i) => i.specie?.name)
                                    .filter((x): x is string => !!x)
                            )
                        ).sort();
                        break;
                    case "superCategorySampleOrigin":
                        values = Array.from(
                            new Set(
                                filtered
                                    .map(
                                        (i) => i.superCategorySampleOrigin?.name
                                    )
                                    .filter((x): x is string => !!x)
                            )
                        ).sort();
                        break;
                    case "sampleOrigin":
                        values = Array.from(
                            new Set(
                                filtered
                                    .map((i) => i.sampleOrigin?.name)
                                    .filter((x): x is string => !!x)
                            )
                        ).sort();
                        break;
                    case "samplingStage":
                        values = Array.from(
                            new Set(
                                filtered
                                    .map((i) => i.samplingStage?.name)
                                    .filter((x): x is string => !!x)
                            )
                        ).sort();
                        break;
                    case "matrixGroup":
                        values = Array.from(
                            new Set(
                                filtered
                                    .map((i) => i.matrixGroup?.name)
                                    .filter((x): x is string => !!x)
                            )
                        ).sort();
                        break;
                    case "matrix":
                        values = Array.from(
                            new Set(
                                filtered
                                    .map((i) => i.matrix?.name)
                                    .filter((x): x is string => !!x)
                            )
                        ).sort();
                        break;
                    default:
                        values = [];
                }
                result[key] = values;
            }
            return result;
        }
        setFilterOptions(computeAvailableOptions(resistanceRawData, selected));
    }, [resistanceRawData, selected]);

    // Get all available substances
    useEffect(() => {
        const substances = Array.from(
            new Set(
                resistanceRawData
                    .map((i) => i.antimicrobialSubstance?.name)
                    .filter(Boolean) as string[]
            )
        ).sort();
        setAllSubstances(substances);
        setSubstanceFilter(substances);
    }, [resistanceRawData]);

    // Update chart data when substanceFilter changes (immediate update!)
    useEffect(() => {
        if (resistanceRawData.length === 0) {
            setFilteredFullData([]);
            setShowChart(false);
            return;
        }
        let result = resistanceRawData;
        if (selected.samplingYear.length)
            result = result.filter((r) =>
                selected.samplingYear.includes(String(r.samplingYear))
            );
        if (selected.specie.length)
            result = result.filter(
                (r) => r.specie && selected.specie.includes(r.specie.name)
            );
        if (selected.superCategorySampleOrigin.length)
            result = result.filter(
                (r) =>
                    r.superCategorySampleOrigin &&
                    selected.superCategorySampleOrigin.includes(
                        r.superCategorySampleOrigin.name
                    )
            );
        if (selected.sampleOrigin.length)
            result = result.filter(
                (r) =>
                    r.sampleOrigin &&
                    selected.sampleOrigin.includes(r.sampleOrigin.name)
            );
        if (selected.samplingStage.length)
            result = result.filter(
                (r) =>
                    r.samplingStage &&
                    selected.samplingStage.includes(r.samplingStage.name)
            );
        if (selected.matrixGroup.length)
            result = result.filter(
                (r) =>
                    r.matrixGroup &&
                    selected.matrixGroup.includes(r.matrixGroup.name)
            );
        if (selected.matrix.length)
            result = result.filter(
                (r) => r.matrix && selected.matrix.includes(r.matrix.name)
            );
        if (substanceFilter.length)
            result = result.filter(
                (r) =>
                    r.antimicrobialSubstance &&
                    substanceFilter.includes(r.antimicrobialSubstance.name)
            );
        setFilteredFullData(result);
        setShowChart(true);
        setCurrentPage(1);
    }, [substanceFilter]); // ONLY updates when substanceFilter changes

    // If you want chart to also update after clicking "Search" for other filters:
    const handleSearch = (): void => {
        let result = resistanceRawData;
        if (selected.samplingYear.length)
            result = result.filter((r) =>
                selected.samplingYear.includes(String(r.samplingYear))
            );
        if (selected.specie.length)
            result = result.filter(
                (r) => r.specie && selected.specie.includes(r.specie.name)
            );
        if (selected.superCategorySampleOrigin.length)
            result = result.filter(
                (r) =>
                    r.superCategorySampleOrigin &&
                    selected.superCategorySampleOrigin.includes(
                        r.superCategorySampleOrigin.name
                    )
            );
        if (selected.sampleOrigin.length)
            result = result.filter(
                (r) =>
                    r.sampleOrigin &&
                    selected.sampleOrigin.includes(r.sampleOrigin.name)
            );
        if (selected.samplingStage.length)
            result = result.filter(
                (r) =>
                    r.samplingStage &&
                    selected.samplingStage.includes(r.samplingStage.name)
            );
        if (selected.matrixGroup.length)
            result = result.filter(
                (r) =>
                    r.matrixGroup &&
                    selected.matrixGroup.includes(r.matrixGroup.name)
            );
        if (selected.matrix.length)
            result = result.filter(
                (r) => r.matrix && selected.matrix.includes(r.matrix.name)
            );
        if (substanceFilter.length)
            result = result.filter(
                (r) =>
                    r.antimicrobialSubstance &&
                    substanceFilter.includes(r.antimicrobialSubstance.name)
            );
        setFilteredFullData(result);
        setShowChart(true);
        setCurrentPage(1);
    };

    // RESET
    const resetFilters = (): void => {
        setSelected({ ...emptyFilterState });
        setShowChart(false);
        setSubstanceFilter(allSubstances); // reset substance to all
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
            if (v.includes("all")) {
                setSubstanceFilter(allSelected ? [] : [...substances]);
            } else {
                setSubstanceFilter(v);
            }
        };
        return (
            <FormControl sx={{ minWidth: 350, marginBottom: 3 }}>
                <InputLabel>{t("ANTIBIOTIC_SUBSTANCE")}</InputLabel>
                <Select
                    multiple
                    value={substanceFilter}
                    onChange={handleChange}
                    label={t("ANTIBIOTIC_SUBSTANCE")}
                    renderValue={(selectedItems) =>
                        Array.isArray(selectedItems)
                            ? selectedItems.join(", ")
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
                            <MenuItem key={item} value={item}>
                                <Checkbox
                                    checked={substanceFilter.indexOf(item) > -1}
                                />
                                <ListItemText primary={item} />
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>
        );
    }

    // RENDER

    // 1. Group by "specie|||matrix|||sampleOrigin"
    const grouped = filteredFullData.reduce((acc, item) => {
        const key = getGroupKey(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, ResistanceApiItem[]>);

    // 2. Helper to check for at least 2 years in a group
    function hasAtLeastTwoYears(groupItems: ResistanceApiItem[]): boolean {
        // Count only years where there is at least one "plottable" entry (N >= 10)
        const yearsWithData = new Set(
            groupItems
                .filter(
                    (i) =>
                        i.anzahlGetesteterIsolate !== undefined &&
                        i.anzahlGetesteterIsolate !== null &&
                        i.anzahlGetesteterIsolate >= 10
                )
                .map((i) => i.samplingYear)
        );
        return yearsWithData.size >= 2;
    }

    // 3. Filter groups
    const groupEntries = Object.entries(grouped);
    const validGroupEntries = groupEntries.filter(([, groupItems]) =>
        hasAtLeastTwoYears(groupItems)
    );
    const totalCharts = validGroupEntries.length;
    const totalPages = Math.ceil(totalCharts / CHARTS_PER_PAGE);
    const paginatedGroups = validGroupEntries.slice(
        (currentPage - 1) * CHARTS_PER_PAGE,
        currentPage * CHARTS_PER_PAGE
    );

    function renderSelectWithSelectAll(
        key: FilterKey,
        label: string,
        infoKey: string,
        categoryKey: string
    ): JSX.Element {
        if (key === "antimicrobialSubstance") return <></>;
        const options = filterOptions[key];
        const value = selected[key];
        const allSelected =
            options.length > 0 && value.length === options.length;
        const someSelected = value.length > 0 && !allSelected;
        const handleChange = (event: SelectChangeEvent<string[]>): void => {
            const v = event.target.value as string[];
            if (v.includes("all")) {
                setSelected((prev) => ({
                    ...prev,
                    [key]: allSelected ? [] : [...options],
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
                                ? selectedItems.join(", ")
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
                                <MenuItem key={item} value={item}>
                                    <Checkbox
                                        checked={value.indexOf(item) > -1}
                                    />
                                    <ListItemText
                                        className="menu-item-text-wrap"
                                        primary={item}
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
                                                    <Typography
                                                        variant="h6"
                                                        mb={1}
                                                        sx={{
                                                            color: "#003663",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {getGroupLabel(
                                                            groupKey,
                                                            t
                                                        )}
                                                    </Typography>
                                                    <TrendChart
                                                        data={chartData}
                                                        fullData={groupItems}
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

                            {trendInfoLoading && (
                                <Box
                                    mt={3}
                                    display="flex"
                                    justifyContent="center"
                                >
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                    >
                                        Loading trend information...
                                    </Typography>
                                </Box>
                            )}
                            {trendInfoError && (
                                <Box
                                    mt={3}
                                    display="flex"
                                    justifyContent="center"
                                >
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
