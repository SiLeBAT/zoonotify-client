import React, { useState } from "react";
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
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { FormattedMicroorganismName } from "./AntibioticResistancePage.component";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse } from "../../shared/model/CMS.model";
import i18next from "i18next";
import { INFORMATION } from "../../shared/infrastructure/router/routes";
import Markdown from "markdown-to-jsx";

interface TrendDetailsProps {
    microorganism: string;
    onBack: () => void;
}

interface Content {
    id: number;
    title: string;
    content: string;
}

const sampleYears = [2020, 2021, 2022, 2023];
const superCategories = ["Animal", "Environment"];
const sampleOrigins = ["Stool", "Blood", "Swab"];
const samplingStages = ["Collection", "Transport", "Lab"];
const matrixGroups = ["Group 1", "Group 2"];
const matrices = ["Matrix A", "Matrix B", "Matrix C"];
const antibioticSubstances = ["Ampicillin", "Ciprofloxacin", "Tetracycline"];
const species = ["Species 1", "Species 2", "Species 3"];

export const TrendDetails: React.FC<TrendDetailsProps> = ({
    microorganism,
    onBack,
}) => {
    const { t } = useTranslation(["Antibiotic"]);

    // Filter states
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

    // Dialog states
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [infoDialogTitle, setInfoDialogTitle] = useState("");
    const [infoDialogContent, setInfoDialogContent] = useState("");

    // Reset all filters
    const resetFilters = (): void => {
        setSelectedYear([]);
        setSelectedAntibioticSubstances([]);
        setSelectedSpecies([]);
        setSelectedSuperCategories([]);
        setSelectedSampleOrigins([]);
        setSelectedSamplingStages([]);
        setSelectedMatrixGroups([]);
        setSelectedMatrices([]);
    };

    // Fetch info for dialog
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

    const handleClose = (): void => {
        setInfoDialogOpen(false);
    };

    // Helper for repeated filter block with info icon
    const FilterWithInfo = ({
        label,
        value,
        onChange,
        options,
        infoKey,
        categoryKey,
    }: {
        label: string;
        value: string[] | number[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange: (v: any) => void;
        options: (string | number)[];
        infoKey: string;
        categoryKey: string;
        type?: "string" | "number";
    }): JSX.Element => (
        <Stack direction="row" spacing={1} alignItems="center">
            <FormControl fullWidth>
                <InputLabel>{label}</InputLabel>
                <Select
                    multiple
                    value={value}
                    onChange={onChange}
                    label={label}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    renderValue={(selected) => (selected as any[]).join(", ")}
                >
                    {options.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
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

    return (
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
                <Stack spacing={2}>
                    <FilterWithInfo
                        label={t("SAMPLING_YEAR")}
                        value={selectedYear}
                        onChange={(e) =>
                            setSelectedYear(
                                typeof e.target.value === "string"
                                    ? e.target.value.split(",").map(Number)
                                    : (e.target.value as number[])
                            )
                        }
                        options={sampleYears}
                        infoKey="More Info on Sampling Year"
                        categoryKey="SAMPLING_YEAR"
                    />
                    <FilterWithInfo
                        label={t("ANTIBIOTIC_SUBSTANCE")}
                        value={selectedAntibioticSubstances}
                        onChange={(e) =>
                            setSelectedAntibioticSubstances(
                                typeof e.target.value === "string"
                                    ? e.target.value.split(",")
                                    : (e.target.value as string[])
                            )
                        }
                        options={antibioticSubstances}
                        infoKey="More Info on Antibiotic Substances"
                        categoryKey="ANTIBIOTIC_SUBSTANCE"
                    />
                    <FilterWithInfo
                        label={t("SPECIES")}
                        value={selectedSpecies}
                        onChange={(e) =>
                            setSelectedSpecies(
                                typeof e.target.value === "string"
                                    ? e.target.value.split(",")
                                    : (e.target.value as string[])
                            )
                        }
                        options={species}
                        infoKey="More Info on Species"
                        categoryKey="SPECIES"
                    />
                    <FilterWithInfo
                        label={t("SUPER-CATEGORY-SAMPLE-ORIGIN")}
                        value={selectedSuperCategories}
                        onChange={(e) =>
                            setSelectedSuperCategories(
                                typeof e.target.value === "string"
                                    ? e.target.value.split(",")
                                    : (e.target.value as string[])
                            )
                        }
                        options={superCategories}
                        infoKey="More Info on Super Categories"
                        categoryKey="SUPER-CATEGORY-SAMPLE-ORIGIN"
                    />
                    <FilterWithInfo
                        label={t("SAMPLE_ORIGIN")}
                        value={selectedSampleOrigins}
                        onChange={(e) =>
                            setSelectedSampleOrigins(
                                typeof e.target.value === "string"
                                    ? e.target.value.split(",")
                                    : (e.target.value as string[])
                            )
                        }
                        options={sampleOrigins}
                        infoKey="More Info on Sample Origins"
                        categoryKey="SAMPLE_ORIGIN"
                    />
                    <FilterWithInfo
                        label={t("SAMPLING_STAGE")}
                        value={selectedSamplingStages}
                        onChange={(e) =>
                            setSelectedSamplingStages(
                                typeof e.target.value === "string"
                                    ? e.target.value.split(",")
                                    : (e.target.value as string[])
                            )
                        }
                        options={samplingStages}
                        infoKey="More Info on Sampling Stages"
                        categoryKey="SAMPLING_STAGE"
                    />
                    <FilterWithInfo
                        label={t("MATRIX_GROUP")}
                        value={selectedMatrixGroups}
                        onChange={(e) =>
                            setSelectedMatrixGroups(
                                typeof e.target.value === "string"
                                    ? e.target.value.split(",")
                                    : (e.target.value as string[])
                            )
                        }
                        options={matrixGroups}
                        infoKey="More Info on Matrix Groups"
                        categoryKey="MATRIX_GROUP"
                    />
                    <FilterWithInfo
                        label={t("MATRIX")}
                        value={selectedMatrices}
                        onChange={(e) =>
                            setSelectedMatrices(
                                typeof e.target.value === "string"
                                    ? e.target.value.split(",")
                                    : (e.target.value as string[])
                            )
                        }
                        options={matrices}
                        infoKey="More Info on Matrices"
                        categoryKey="MATRIX"
                    />
                </Stack>
                {/* Buttons */}
                <Box mt={4} display="flex" justifyContent="center" gap={2}>
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        sx={{ minWidth: 120, background: "#003663" }}
                        // onClick={handleSearch} // Implement real logic later
                    >
                        {t("SEARCH")}
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ minWidth: 120, background: "#003663" }}
                        onClick={resetFilters}
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
                {/* ...rest of your content */}
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
    );
};
