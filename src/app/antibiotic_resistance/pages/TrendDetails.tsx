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

interface TrendDetailsProps {
    microorganism: string;
    onBack: () => void;
}

interface Content {
    id: number;
    title: string;
    content: string;
}

// ---- FLAT STRAPI v5 DATA ----
interface ResistanceApiItem {
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
    // ...any other fields
}

interface ResistanceApiResponse {
    data: ResistanceApiItem[];
    meta: unknown;
}

// CSS for wrapping long menu item text
const menuItemTextStyle = `
.menu-item-text-wrap {
  white-space: normal !important;
  word-break: break-word !important;
  max-width: 260px;
  display: block;
}
`;

export const TrendDetails: React.FC<TrendDetailsProps> = ({
    microorganism,
    onBack,
}) => {
    const { t } = useTranslation(["Antibiotic"]);

    // --- Dropdown Option States (dynamically loaded) ---
    const [sampleYearOptions, setSampleYearOptions] = useState<number[]>([]);
    const [antibioticSubstanceOptions, setAntibioticSubstanceOptions] =
        useState<string[]>([]);
    const [speciesOptions, setSpeciesOptions] = useState<string[]>([]);
    const [superCategoryOptions, setSuperCategoryOptions] = useState<string[]>(
        []
    );
    const [sampleOriginOptions, setSampleOriginOptions] = useState<string[]>(
        []
    );
    const [samplingStageOptions, setSamplingStageOptions] = useState<string[]>(
        []
    );
    const [matrixGroupOptions, setMatrixGroupOptions] = useState<string[]>([]);
    const [matrixOptions, setMatrixOptions] = useState<string[]>([]);

    // --- Filter Selections ---
    const [selectedYear, setSelectedYear] = useState<number[]>([]);
    const [selectedAntibioticSubstances, setSelectedAntibioticSubstances] =
        useState<string[]>([]);
    const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
    const [selectedSuperCategories, setSelectedSuperCategories] = useState<
        string[]
    >([]);
    const [selectedSampleOrigins, setSelectedSampleOrigins] = useState<
        string[]
    >([]);
    const [selectedSamplingStages, setSelectedSamplingStages] = useState<
        string[]
    >([]);
    const [selectedMatrixGroups, setSelectedMatrixGroups] = useState<string[]>(
        []
    );
    const [selectedMatrices, setSelectedMatrices] = useState<string[]>([]);

    // --- Loading and Error States ---
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // --- Dialog States for Info ---
    const [infoDialogOpen, setInfoDialogOpen] = useState<boolean>(false);
    const [infoDialogTitle, setInfoDialogTitle] = useState<string>("");
    const [infoDialogContent, setInfoDialogContent] = useState<string>("");

    // --- Data for chart ---
    const [resistanceRawData, setResistanceRawData] = useState<
        ResistanceApiItem[]
    >([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [showChart, setShowChart] = useState(false);

    // --- Fetch dynamic filter options from /resistances ---
    useEffect((): void => {
        async function fetchResistanceOptions(): Promise<void> {
            setLoading(true);
            setFetchError(null);
            try {
                const url =
                    `${RESISTANCES}?locale=${i18next.language}` +
                    `&filters[microorganism][name][$eq]=${encodeURIComponent(
                        microorganism
                    )}` +
                    `&populate=*&pagination[pageSize]=500`;

                const res = await callApiService<ResistanceApiResponse>(url);
                const data = res.data?.data || [];

                setResistanceRawData(data);

                setSampleYearOptions(
                    Array.from(
                        new Set(
                            data
                                .map((item) => item.samplingYear)
                                .filter(
                                    (v): v is number => typeof v === "number"
                                )
                        )
                    ).sort((a, b) => a - b)
                );
                setSuperCategoryOptions(
                    Array.from(
                        new Set(
                            data
                                .map(
                                    (item) =>
                                        item.superCategorySampleOrigin?.name
                                )
                                .filter((v): v is string => !!v)
                        )
                    )
                );
                setSampleOriginOptions(
                    Array.from(
                        new Set(
                            data
                                .map((item) => item.sampleOrigin?.name)
                                .filter((v): v is string => !!v)
                        )
                    )
                );
                setSamplingStageOptions(
                    Array.from(
                        new Set(
                            data
                                .map((item) => item.samplingStage?.name)
                                .filter((v): v is string => !!v)
                        )
                    )
                );
                setMatrixGroupOptions(
                    Array.from(
                        new Set(
                            data
                                .map((item) => item.matrixGroup?.name)
                                .filter((v): v is string => !!v)
                        )
                    )
                );
                setMatrixOptions(
                    Array.from(
                        new Set(
                            data
                                .map((item) => item.matrix?.name)
                                .filter((v): v is string => !!v)
                        )
                    )
                );
                setAntibioticSubstanceOptions(
                    Array.from(
                        new Set(
                            data
                                .map(
                                    (item) => item.antimicrobialSubstance?.name
                                )
                                .filter((v): v is string => !!v)
                        )
                    )
                );
                setSpeciesOptions(
                    Array.from(
                        new Set(
                            data
                                .map((item) => item.specie?.name)
                                .filter((v): v is string => !!v)
                        )
                    )
                );
            } catch (err) {
                setFetchError(
                    "Failed to fetch filter options. Please try again."
                );
                // eslint-disable-next-line no-console
                console.error("Failed to fetch resistance options", err);
            } finally {
                setLoading(false);
            }
        }
        if (microorganism) {
            fetchResistanceOptions();
            setShowChart(false); // Hide chart on microorganism change
        }
    }, [i18next.language, microorganism]);

    // --- Reset all filters ---
    const resetFilters = (): void => {
        setSelectedYear([]);
        setSelectedAntibioticSubstances([]);
        setSelectedSpecies([]);
        setSelectedSuperCategories([]);
        setSelectedSampleOrigins([]);
        setSelectedSamplingStages([]);
        setSelectedMatrixGroups([]);
        setSelectedMatrices([]);
        setShowChart(false);
    };

    // --- Fetch info for dialog ---
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
            // eslint-disable-next-line no-console
            console.error("Failed to fetch information:", err);
        }
    };

    const handleClose = (): void => {
        setInfoDialogOpen(false);
    };

    // --- Search and filter data for the chart ---
    const handleSearch = (): void => {
        let result = resistanceRawData;

        if (selectedYear.length)
            result = result.filter((r) =>
                selectedYear.includes(r.samplingYear)
            );
        if (selectedAntibioticSubstances.length)
            result = result.filter(
                (r) =>
                    r.antimicrobialSubstance &&
                    selectedAntibioticSubstances.includes(
                        r.antimicrobialSubstance.name
                    )
            );
        if (selectedSpecies.length)
            result = result.filter(
                (r) => r.specie && selectedSpecies.includes(r.specie.name)
            );
        if (selectedSuperCategories.length)
            result = result.filter(
                (r) =>
                    r.superCategorySampleOrigin &&
                    selectedSuperCategories.includes(
                        r.superCategorySampleOrigin.name
                    )
            );
        if (selectedSampleOrigins.length)
            result = result.filter(
                (r) =>
                    r.sampleOrigin &&
                    selectedSampleOrigins.includes(r.sampleOrigin.name)
            );
        if (selectedSamplingStages.length)
            result = result.filter(
                (r) =>
                    r.samplingStage &&
                    selectedSamplingStages.includes(r.samplingStage.name)
            );
        if (selectedMatrixGroups.length)
            result = result.filter(
                (r) =>
                    r.matrixGroup &&
                    selectedMatrixGroups.includes(r.matrixGroup.name)
            );
        if (selectedMatrices.length)
            result = result.filter(
                (r) => r.matrix && selectedMatrices.includes(r.matrix.name)
            );

        const chartData = result
            .map((r) => ({
                samplingYear: r.samplingYear,
                resistenzrate: r.resistenzrate,
                antimicrobialSubstance: r.antimicrobialSubstance?.name ?? "",
            }))
            .filter((d) => !!d.antimicrobialSubstance);

        setFilteredData(chartData);
        setShowChart(true);
    };

    // --- Select All/Deselect All helper (WITH TEXT WRAP + MAX HEIGHT) ---
    function renderSelectWithSelectAll<T extends string | number>(
        label: string,
        selectValue: T[],
        setSelectValue: (items: T[]) => void,
        options: T[],
        infoKey: string,
        categoryKey: string
    ): JSX.Element {
        const allSelected =
            options.length > 0 && selectValue.length === options.length;
        const someSelected = selectValue.length > 0 && !allSelected;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleChange = (event: any): void => {
            const value = event.target.value as T[];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (value.includes("all" as any)) {
                setSelectValue(allSelected ? [] : [...options]);
            } else {
                setSelectValue(value);
            }
        };

        return (
            <Stack direction="row" spacing={1} alignItems="center">
                <FormControl fullWidth>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        multiple
                        value={selectValue}
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
                                        checked={selectValue.indexOf(item) > -1}
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
                            t("SAMPLING_YEAR"),
                            selectedYear,
                            setSelectedYear,
                            sampleYearOptions,
                            "More Info on Sampling Year",
                            "SAMPLING_YEAR"
                        )}
                        {renderSelectWithSelectAll(
                            t("ANTIBIOTIC_SUBSTANCE"),
                            selectedAntibioticSubstances,
                            setSelectedAntibioticSubstances,
                            antibioticSubstanceOptions,
                            "More Info on Antibiotic Substances",
                            "ANTIBIOTIC_SUBSTANCE"
                        )}
                        {renderSelectWithSelectAll(
                            t("SPECIES"),
                            selectedSpecies,
                            setSelectedSpecies,
                            speciesOptions,
                            "More Info on Species",
                            "SPECIES"
                        )}
                        {renderSelectWithSelectAll(
                            t("SUPER-CATEGORY-SAMPLE-ORIGIN"),
                            selectedSuperCategories,
                            setSelectedSuperCategories,
                            superCategoryOptions,
                            "More Info on Super Categories",
                            "SUPER-CATEGORY-SAMPLE-ORIGIN"
                        )}
                        {renderSelectWithSelectAll(
                            t("SAMPLE_ORIGIN"),
                            selectedSampleOrigins,
                            setSelectedSampleOrigins,
                            sampleOriginOptions,
                            "More Info on Sample Origins",
                            "SAMPLE_ORIGIN"
                        )}
                        {renderSelectWithSelectAll(
                            t("SAMPLING_STAGE"),
                            selectedSamplingStages,
                            setSelectedSamplingStages,
                            samplingStageOptions,
                            "More Info on Sampling Stages",
                            "SAMPLING_STAGE"
                        )}
                        {renderSelectWithSelectAll(
                            t("MATRIX_GROUP"),
                            selectedMatrixGroups,
                            setSelectedMatrixGroups,
                            matrixGroupOptions,
                            "More Info on Matrix Groups",
                            "MATRIX_GROUP"
                        )}
                        {renderSelectWithSelectAll(
                            t("MATRIX"),
                            selectedMatrices,
                            setSelectedMatrices,
                            matrixOptions,
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
                            <TrendChart data={filteredData} />
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
