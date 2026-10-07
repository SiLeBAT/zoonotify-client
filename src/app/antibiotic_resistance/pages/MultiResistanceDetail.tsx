import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "react-i18next";

import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse } from "../../shared/model/CMS.model";
import {
    INFORMATION,
    MULTI_RESISTANCE_INFORMATION,
} from "../../shared/infrastructure/router/routes";
import { SidebarComponent } from "../../shared/components/layout/SidebarComponent";
import { MultiResistanceChart } from "./MultiResistanceChart";
import { fetchMultiResistance } from "./multiResistanceData";
import {
    type MultiResistanceItem,
    buildMultiResistanceBars,
    decodeMultiResistanceState,
    encodeMultiResistanceState,
} from "./multiResistanceHelpers";
import {
    type FilterKey,
    emptyFilterState,
    filterDataExcludingKey,
    shouldShowSpeciesFilter,
    uniqueFromItems,
} from "./resistanceHelpers";

const menuItemTextStyle = `.menu-item-text-wrap {
  white-space: normal !important;
  word-break: break-word !important;
  max-width: 260px;
  display: block;
}`;

/** Rows matching every panel selection; an empty selection does not constrain. */
function applyFilters(
    rows: MultiResistanceItem[],
    sel: Record<FilterKey, string[]>
): MultiResistanceItem[] {
    // excluding the (unused) substance key applies every panel key
    return filterDataExcludingKey(rows, sel, [], "antimicrobialSubstance");
}

export const MultiResistanceDetail: React.FC<{
    microorganism: string;
    breadcrumb?: React.ReactNode;
}> = ({ microorganism, breadcrumb }) => {
    const { t, i18n } = useTranslation(["Antibiotic"]);
    const apiLocale = (i18n.language || "en").toLowerCase().startsWith("de")
        ? "de"
        : "en";

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [rows, setRows] = useState<MultiResistanceItem[]>([]);
    const [loading, setLoading] = useState(true);

    // `selected` is what the panel shows; `applied` is what Search committed
    const [selected, setSelected] = useState<Record<FilterKey, string[]>>({
        ...emptyFilterState,
    });
    const [applied, setApplied] = useState<Record<FilterKey, string[]>>({
        ...emptyFilterState,
    });
    const [year, setYear] = useState<number | undefined>(undefined);
    // null = every Combination of the year (the default; the picker only narrows)
    const [pickedCombinations, setPickedCombinations] = useState<
        string[] | null
    >(null);

    const [infoDialog, setInfoDialog] = useState<{
        title: string;
        content: string;
    } | null>(null);

    // the text box below the graph, maintained in the CMS
    const [multiInfo, setMultiInfo] = useState<{
        title: string;
        description: string;
    } | null>(null);

    const hydratedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        async function load(): Promise<void> {
            setLoading(true);
            try {
                const data = await fetchMultiResistance(
                    microorganism,
                    apiLocale
                );
                if (!cancelled) setRows(data);
            } catch (err) {
                console.error("Failed to fetch multi-resistance data", err);
                if (!cancelled) setRows([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [microorganism, apiLocale]);

    useEffect(() => {
        let cancelled = false;

        async function loadInfo(): Promise<void> {
            try {
                const response = await callApiService<
                    CMSResponse<
                        { title?: string; description?: string },
                        unknown
                    >
                >(`${MULTI_RESISTANCE_INFORMATION}?locale=${apiLocale}`);
                const data = response.data?.data;
                if (cancelled) return;
                // an unpublished single type has nothing to show
                setMultiInfo(
                    data?.title || data?.description
                        ? {
                              title: data.title ?? "",
                              description: data.description ?? "",
                          }
                        : null
                );
            } catch (err) {
                console.error(
                    "Failed to fetch multi-resistance information",
                    err
                );
                if (!cancelled) setMultiInfo(null);
            }
        }

        loadInfo();
        return () => {
            cancelled = true;
        };
    }, [apiLocale]);

    // Restore a share link once the rows it refers to are here
    useEffect(() => {
        if (hydratedRef.current || loading) return;
        hydratedRef.current = true;
        const s = new URLSearchParams(window.location.search).get("s");
        const decoded = s ? decodeMultiResistanceState(s, rows) : null;
        if (!decoded || decoded.microorganism !== microorganism) return;
        setSelected(decoded.selected);
        setApplied(decoded.selected);
        setYear(decoded.year);
        if (decoded.combinations.length)
            setPickedCombinations(decoded.combinations);
    }, [loading, rows, microorganism]);

    const filtered = useMemo(
        () => applyFilters(rows, applied),
        [rows, applied]
    );

    const years = useMemo(
        () =>
            Array.from(new Set(filtered.map((r) => r.samplingYear))).sort(
                (a, b) => b - a
            ),
        [filtered]
    );
    const chartYear =
        year !== undefined && years.includes(year) ? year : years[0];

    const { bars, belowMinimum } = useMemo(
        () =>
            buildMultiResistanceBars(
                filtered.filter((r) => r.samplingYear === chartYear),
                microorganism
            ),
        [filtered, chartYear, microorganism]
    );

    // picker order = bar order: plotted Combinations, then the ones under Minimum N
    const pickerEntries = [...bars, ...belowMinimum];
    const availableKeys = pickerEntries.map((b) => b.key);
    const stillPicked = (pickedCombinations ?? []).filter((k) =>
        availableKeys.includes(k)
    );
    // a pick whose Combinations all vanished (new year/filters) falls back to all;
    // a deliberate "deselect all" ([]) shows none
    const shownKeys =
        pickedCombinations === null ||
        (pickedCombinations.length > 0 && stillPicked.length === 0)
            ? availableKeys
            : stillPicked;
    const shownBars = bars.filter((b) => shownKeys.includes(b.key));

    // Keep ?s= in step with what is on screen
    useEffect(() => {
        if (!hydratedRef.current || loading) return;
        const s = encodeMultiResistanceState(
            {
                microorganism,
                lang: apiLocale,
                selected: applied,
                year: chartYear,
                combinations: stillPicked,
            },
            rows
        );
        window.history.replaceState(null, "", `?s=${s}`);
    }, [
        microorganism,
        apiLocale,
        applied,
        chartYear,
        stillPicked.join(),
        rows,
        loading,
    ]);

    const handleSearch = (): void => {
        setApplied(selected);
        setPickedCombinations(null);
    };

    const resetFilters = (): void => {
        setSelected({ ...emptyFilterState });
        setApplied({ ...emptyFilterState });
        setYear(undefined);
        setPickedCombinations(null);
    };

    const handleInfoClick = async (categoryKey: string): Promise<void> => {
        try {
            const url = `${INFORMATION}?filters[title][$eqi]=${encodeURIComponent(
                t(categoryKey)
            )}&locale=${apiLocale}&pagination[pageSize]=1`;
            const response = await callApiService<
                CMSResponse<Array<{ title: string; content: string }>, unknown>
            >(url);
            const entity = response.data?.data[0];
            if (entity)
                setInfoDialog({ title: entity.title, content: entity.content });
        } catch (err) {
            console.error("Failed to fetch information:", err);
        }
    };

    function renderSelectWithSelectAll(
        key: FilterKey,
        label: string,
        infoKey: string,
        categoryKey: string
    ): JSX.Element {
        // options cascade from every other selection
        const options = uniqueFromItems(
            filterDataExcludingKey(rows, selected, [], key),
            key
        );
        const value = selected[key];
        const allSelected =
            options.length > 0 && value.length === options.length;

        const handleChange = (event: SelectChangeEvent<string[]>): void => {
            const v = event.target.value as string[];
            setSelected((prev) => ({
                ...prev,
                [key]: v.includes("all")
                    ? allSelected
                        ? []
                        : options.map((o) => o.documentId)
                    : v,
            }));
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
                        renderValue={(items) =>
                            options
                                .filter((o) => items.includes(o.documentId))
                                .map((o) => o.name)
                                .join(", ")
                        }
                        MenuProps={{
                            variant: "menu",
                            PaperProps: { style: { maxHeight: 400 } },
                        }}
                    >
                        <MenuItem value="all">
                            <Checkbox
                                checked={allSelected}
                                indeterminate={value.length > 0 && !allSelected}
                            />
                            <ListItemText
                                className="menu-item-text-wrap"
                                primary={
                                    allSelected
                                        ? t("DESELECT_ALL")
                                        : t("SELECT_ALL")
                                }
                            />
                        </MenuItem>
                        {options.map((item) => (
                            <MenuItem
                                key={item.documentId}
                                value={item.documentId}
                            >
                                <Checkbox
                                    checked={value.includes(item.documentId)}
                                />
                                <ListItemText
                                    className="menu-item-text-wrap"
                                    primary={item.name}
                                    primaryTypographyProps={
                                        key === "specie"
                                            ? { fontStyle: "italic" }
                                            : undefined
                                    }
                                />
                            </MenuItem>
                        ))}
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

    function renderResults(): JSX.Element {
        if (loading) {
            return (
                <Stack alignItems="center" my={3}>
                    <CircularProgress />
                </Stack>
            );
        }
        if (rows.length === 0) {
            return (
                <Typography sx={{ mt: 3, fontStyle: "italic" }}>
                    {t("No_multi_resistance_data")}
                </Typography>
            );
        }
        if (filtered.length === 0 || chartYear === undefined) {
            return (
                <Typography sx={{ mt: 3, fontStyle: "italic" }}>
                    {t("No data for selected filters.")}
                </Typography>
            );
        }
        if (bars.length === 0) {
            return (
                <Typography sx={{ mt: 3, fontStyle: "italic" }}>
                    {t("Not enough data to display the chart")}
                </Typography>
            );
        }
        if (shownBars.length === 0) {
            return (
                <Typography sx={{ mt: 3, fontStyle: "italic" }}>
                    {t("No data for selected filters.")}
                </Typography>
            );
        }
        return (
            <MultiResistanceChart
                bars={shownBars}
                year={chartYear}
                microorganism={microorganism}
            />
        );
    }

    const allPicked = shownKeys.length === availableKeys.length;

    return (
        <>
            <style>{menuItemTextStyle}</style>
            <style>{`.abx-breadcrumb { position: static !important; z-index: 1 !important; }`}</style>

            <Box
                display="flex"
                flexDirection="row"
                sx={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "100%",
                    minHeight: 0,
                    overflow: "hidden",
                }}
            >
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
                            height: "100%",
                            maxHeight: "100%",
                            boxSizing: "border-box",
                        }}
                    >
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

                <Box
                    flex={1}
                    px={4}
                    py={3}
                    sx={{
                        overflow: "auto",
                        minHeight: 0,
                        boxSizing: "border-box",
                        boxShadow: "15px 0 15px -15px rgba(0,0,0,0.15) inset",
                        backgroundColor: "#fff",
                        marginLeft: "20px",
                    }}
                >
                    {breadcrumb}

                    {years.length > 0 && (
                        <Stack spacing={2} sx={{ mb: 2 }}>
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                            >
                                <FormControl sx={{ minWidth: 180 }}>
                                    <InputLabel>
                                        {t("SAMPLING_YEAR")}
                                    </InputLabel>
                                    <Select
                                        value={chartYear ?? ""}
                                        label={t("SAMPLING_YEAR")}
                                        onChange={(e) => {
                                            setYear(Number(e.target.value));
                                            setPickedCombinations(null);
                                        }}
                                    >
                                        {years.map((y) => (
                                            <MenuItem key={y} value={y}>
                                                {y}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Tooltip
                                    title={t("More Info on Sampling Year")}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            handleInfoClick("SAMPLING_YEAR")
                                        }
                                    >
                                        <InfoIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                            >
                                <FormControl
                                    sx={{ width: 520, maxWidth: "100%" }}
                                >
                                    <InputLabel>{t("combinations")}</InputLabel>
                                    <Select
                                        multiple
                                        value={shownKeys}
                                        label={t("combinations")}
                                        onChange={(e) => {
                                            const v = e.target
                                                .value as string[];
                                            if (v.includes("all")) {
                                                // null = the default: every Combination
                                                setPickedCombinations(
                                                    allPicked ? [] : null
                                                );
                                                return;
                                            }
                                            setPickedCombinations(v);
                                        }}
                                        renderValue={(keys) =>
                                            pickerEntries
                                                .filter((b) =>
                                                    keys.includes(b.key)
                                                )
                                                .map((b) => b.name)
                                                .join(", ")
                                        }
                                        MenuProps={{
                                            variant: "menu",
                                            PaperProps: {
                                                style: { maxHeight: 400 },
                                            },
                                        }}
                                    >
                                        <MenuItem value="all">
                                            <Checkbox
                                                checked={allPicked}
                                                indeterminate={
                                                    shownKeys.length > 0 &&
                                                    !allPicked
                                                }
                                            />
                                            <ListItemText
                                                primary={
                                                    allPicked
                                                        ? t("DESELECT_ALL")
                                                        : t("SELECT_ALL")
                                                }
                                            />
                                        </MenuItem>
                                        {pickerEntries.map((b) => {
                                            const plotted = bars.includes(b);
                                            return (
                                                <MenuItem
                                                    key={b.key}
                                                    value={b.key}
                                                >
                                                    <Checkbox
                                                        checked={shownKeys.includes(
                                                            b.key
                                                        )}
                                                    />
                                                    <ListItemText
                                                        primary={
                                                            <span>
                                                                {b.name}
                                                                <span
                                                                    style={{
                                                                        color: "#888",
                                                                    }}
                                                                >
                                                                    {" "}
                                                                    (
                                                                    {plotted
                                                                        ? `N=${b.n}`
                                                                        : `N=${
                                                                              b.n
                                                                          }, ${t(
                                                                              "data_not_plotted"
                                                                          )}`}
                                                                    )
                                                                </span>
                                                            </span>
                                                        }
                                                    />
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                                <Tooltip title={t("More Info on Combinations")}>
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            handleInfoClick("combinations")
                                        }
                                    >
                                        <InfoIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    )}

                    <Box mt={2} mb={2}>
                        {renderResults()}
                    </Box>

                    {multiInfo && (
                        <Box
                            data-testid="multi-resistance-information"
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
                                {multiInfo.title}
                            </Typography>
                            <Markdown options={{ forceBlock: true }}>
                                {multiInfo.description}
                            </Markdown>
                        </Box>
                    )}
                </Box>

                <Dialog
                    open={infoDialog !== null}
                    onClose={() => setInfoDialog(null)}
                >
                    <DialogTitle>{infoDialog?.title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <Markdown>{infoDialog?.content ?? ""}</Markdown>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setInfoDialog(null)}>
                            {t("CLOSE", "Close")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};
