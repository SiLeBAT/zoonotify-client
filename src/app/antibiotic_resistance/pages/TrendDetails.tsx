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
    Checkbox,
    ListItemText,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { FormattedMicroorganismName } from "./AntibioticResistancePage.component";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse } from "../../shared/model/CMS.model";
import i18next from "i18next";
import {
    INFORMATION,
    RESISTANCES,
} from "../../shared/infrastructure/router/routes";
import Markdown from "markdown-to-jsx";
import { TrendChart } from "./TrendChart";
import type { SelectChangeEvent } from "@mui/material/Select";

interface TrendDetailsProps {
    microorganism: string;
    onBack: () => void;
}

interface Content {
    id: number;
    title: string;
    content: string;
}

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

interface ResistanceApiResponse {
    data: ResistanceApiItem[];
    meta: unknown;
}

const menuItemTextStyle = `
.menu-item-text-wrap {
  white-space: normal !important;
  word-break: break-word !important;
  max-width: 260px;
  display: block;
}
`;

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

// ---- URL Sync Helpers ----
function updateUrlWithFilters(
    selected: Record<FilterKey, string[]>,
    microorganism: string
): void {
    const params = new URLSearchParams(window.location.search);
    [
        "samplingYear",
        "antimicrobialSubstance",
        "specie",
        "superCategorySampleOrigin",
        "sampleOrigin",
        "samplingStage",
        "matrixGroup",
        "matrix",
    ].forEach((key) => params.delete(key));
    Object.entries(selected).forEach(([key, arr]) => {
        arr.forEach((val) => params.append(key, val));
    });
    if (!params.has("microorganism"))
        params.set("microorganism", microorganism);
    params.set("view", "trend");
    params.set("lang", i18next.language);
    window.history.replaceState(null, "", `?${params.toString()}`);
}

function readFiltersFromUrl(): Record<FilterKey, string[]> {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return {
        samplingYear: urlSearchParams.getAll("samplingYear"),
        antimicrobialSubstance: urlSearchParams.getAll(
            "antimicrobialSubstance"
        ),
        specie: urlSearchParams.getAll("specie"),
        superCategorySampleOrigin: urlSearchParams.getAll(
            "superCategorySampleOrigin"
        ),
        sampleOrigin: urlSearchParams.getAll("sampleOrigin"),
        samplingStage: urlSearchParams.getAll("samplingStage"),
        matrixGroup: urlSearchParams.getAll("matrixGroup"),
        matrix: urlSearchParams.getAll("matrix"),
    };
}

// ---- Main Component ----
export const TrendDetails: React.FC<TrendDetailsProps> = ({
    microorganism,
    onBack,
}) => {
    const { t } = useTranslation(["Antibiotic"]);

    // --- Raw data ---
    const [resistanceRawData, setResistanceRawData] = useState<
        ResistanceApiItem[]
    >([]);
    const [filterOptions, setFilterOptions] = useState<
        Record<FilterKey, string[]>
    >({ ...emptyFilterState });
    const [selected, setSelected] = useState<Record<FilterKey, string[]>>({
        ...emptyFilterState,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [filteredFullData, setFilteredFullData] = useState<
        ResistanceApiItem[]
    >([]);
    const [showChart, setShowChart] = useState(false);

    // --- UI/UX states ---
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [infoDialogTitle, setInfoDialogTitle] = useState("");
    const [infoDialogContent, setInfoDialogContent] = useState("");

    // --- Search ---
    const handleSearch = (): void => {
        let result = resistanceRawData;
        if (selected.samplingYear.length)
            result = result.filter((r) =>
                selected.samplingYear.includes(String(r.samplingYear))
            );
        if (selected.antimicrobialSubstance.length)
            result = result.filter(
                (r) =>
                    r.antimicrobialSubstance &&
                    selected.antimicrobialSubstance.includes(
                        r.antimicrobialSubstance.name
                    )
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
        setFilteredFullData(result);
        const chartData = result
            .map((r) => ({
                samplingYear: r.samplingYear,
                resistenzrate: r.resistenzrate,
                antimicrobialSubstance: r.antimicrobialSubstance?.name ?? "",
                anzahlGetesteterIsolate: r.anzahlGetesteterIsolate,
            }))
            .filter((d) => !!d.antimicrobialSubstance);

        setFilteredData(chartData);
        setShowChart(true);
    };

    // --------- Data fetching & initialization with deep linking -----------
    // 1. On mount, read filters from URL and set them
    useEffect(() => {
        const initialSelected = readFiltersFromUrl();
        setSelected(initialSelected);
        const anySelected = Object.values(initialSelected).some(
            (arr) => arr.length > 0
        );
        if (anySelected) {
            setShowChart(false); // Will set to true on search
        }
    }, []);

    // 2. Fetch all resistance data for the microorganism whenever microorganism or lang changes
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

                const res = await callApiService<ResistanceApiResponse>(url);
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

    // 3. Recompute filter options as in your logic
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
                        (exclude === "antimicrobialSubstance" ||
                            !currentSelected.antimicrobialSubstance.length ||
                            (item.antimicrobialSubstance &&
                                currentSelected.antimicrobialSubstance.includes(
                                    item.antimicrobialSubstance.name
                                ))) &&
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
                    case "antimicrobialSubstance":
                        values = Array.from(
                            new Set(
                                filtered
                                    .map((i) => i.antimicrobialSubstance?.name)
                                    .filter((x): x is string => !!x)
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

    // 4. Deep linking: Update URL every time filters change
    useEffect(() => {
        updateUrlWithFilters(selected, microorganism);
    }, [selected, microorganism]);

    // 5. Deep linking: update lang param in URL if language changes
    useEffect(() => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        urlSearchParams.set("lang", i18next.language);
        window.history.replaceState(null, "", `?${urlSearchParams.toString()}`);
    }, [i18next.language]);

    useEffect(() => {
        const anyFilter = Object.values(selected).some((arr) => arr.length > 0);
        if (anyFilter && !showChart && resistanceRawData.length > 0) {
            handleSearch();
        }
    }, [selected, showChart, resistanceRawData]);

    // --- Reset all filters ---
    const resetFilters = (): void => {
        setSelected({ ...emptyFilterState });
        setShowChart(false);
    };

    // --- Info Dialog ---
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
        } catch (err) {
            console.error("Failed to fetch information:", err);
        }
    };
    const handleClose = (): void => setInfoDialogOpen(false);

    // --- Render MUI Select ---
    function renderSelectWithSelectAll(
        key: FilterKey,
        label: string,
        infoKey: string,
        categoryKey: string
    ): JSX.Element {
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
                                primaryTypographyProps={{
                                    style: {
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                        display: "block",
                                        maxWidth: "240px",
                                    },
                                }}
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
                                        primaryTypographyProps={{
                                            style: {
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                                display: "block",
                                                maxWidth: "240px",
                                            },
                                        }}
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
                        width: 330,
                        height: "calc(100vh - 56px)",
                        bgcolor: "#fff",
                        borderRight: "1px solid #e0e0e0",
                        p: 3,
                        overflowY: "auto",
                        zIndex: 1000,
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
                        {renderSelectWithSelectAll(
                            "samplingYear",
                            t("SAMPLING_YEAR"),
                            "More Info on Sampling Year",
                            "SAMPLING_YEAR"
                        )}
                        {renderSelectWithSelectAll(
                            "antimicrobialSubstance",
                            t("ANTIBIOTIC_SUBSTANCE"),
                            "More Info on Antibiotic Substances",
                            "ANTIBIOTIC_SUBSTANCE"
                        )}
                        {renderSelectWithSelectAll(
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
                    {/* Buttons */}
                    <Box mt={4} display="flex" justifyContent="center" gap={2}>
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
                </Paper>
                {/* MAIN CONTENT */}
                <Box flex={1} ml="370px" px={4} py={3}>
                    {/* Breadcrumb */}
                    <div style={{ marginBottom: "2rem" }}>
                        <Typography
                            component="span"
                            sx={{
                                fontSize: "1.75rem",
                                color: "#003663",
                            }}
                        >
                            {t("Antibiotic resistance")} /{" "}
                            <FormattedMicroorganismName
                                microName={microorganism}
                                isBreadcrumb={true}
                            />{" "}
                            / {t("Trend graph")}
                        </Typography>
                    </div>
                    <Button
                        onClick={onBack}
                        variant="contained"
                        sx={{
                            marginBottom: "2rem",
                            backgroundColor: "#003663",
                            color: "#fff",
                        }}
                    >
                        {t("Back")}
                    </Button>
                    {/* Trend Chart */}
                    {showChart && (
                        <Box mt={2} mb={2}>
                            <TrendChart
                                data={filteredData}
                                fullData={filteredFullData}
                            />
                        </Box>
                    )}
                </Box>
                {/* Dialog for Info Content */}
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
