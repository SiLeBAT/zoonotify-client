import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Checkbox,
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
import InfoIcon from "@mui/icons-material/Info";
import Markdown from "markdown-to-jsx";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import {
    INFORMATION,
    TYPING_INFORMATION,
} from "../../shared/infrastructure/router/routes";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";
import { MainWithSideLayout } from "../../shared/components/layout/MainWithSideLayoutComponent";
import { primaryColor } from "../../shared/style/Style-MainTheme";
import {
    MICROORGANISM_PARAM,
    TYPING_ORGANISMS,
    TypingOrganism,
} from "./typingOrganisms";
import { fetchTypingResults, samplingYears, TypingResult } from "./typingData";
import { buildSerovarChart, SerovarCombination } from "./serovarChart";
import { SerovarBarChart } from "./SerovarBarChart";
import { TypingSearchOptions } from "./TypingSearchOptions";
import {
    emptyTypingSelection,
    filterTypingRows,
    readTypingSelection,
    typingFilterOptions,
    TypingSelection,
    writeTypingSelection,
} from "./typingFilters";

// MUI's styled rather than the emotion css prop: the css prop needs the
// @jsxImportSource pragma, which jest's classic-runtime babel cannot compile.
// Sidebar styling mirrors the AMR page's microorganism selection
// (`.abx-nav-item` in AntibioticResistancePage) so the two pages read alike.
const Page = styled("div")`
    display: flex;
    min-height: 100%;

    @media (max-width: 900px) {
        flex-direction: column;
    }
`;

const Sidebar = styled("nav")`
    width: 450px;
    padding: 2rem;
    box-sizing: border-box;
    background: #fff;

    @media (max-width: 900px) {
        width: 100%;
        padding: 1.25rem;
    }
`;

const NavList = styled("ul")`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const NavItem = styled("button", {
    shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(
    ({ active }) => `
    display: block;
    width: 100%;
    margin-bottom: 1.25rem;
    padding: 1.5rem 2rem 1.5rem 3rem;
    border: 0;
    clip-path: polygon(
        0 0,
        calc(100% - 40px) 0,
        100% 50%,
        calc(100% - 40px) 100%,
        0 100%
    );
    background: ${active ? "#BFE1F2" : "#003663"};
    color: ${active ? "#003663" : "#fff"};
    font-family: inherit;
    font-size: 1.3rem;
    font-weight: bold;
    text-align: left;
    cursor: pointer;

    /* clip-path cuts off an outer outline, so draw the ring inside */
    &:focus-visible {
        outline: 3px solid ${active ? "#003663" : "#fff"};
        outline-offset: -6px;
    }
`
);

const Content = styled("section")`
    flex: 1;
    padding: 3rem;
    box-sizing: border-box;
    color: ${primaryColor};

    @media (max-width: 900px) {
        padding: 1.25rem;
    }
`;

const Title = styled("h1")`
    margin-top: 0;
    font-size: 1.6rem;
`;

function OrganismName({ organism }: { organism: TypingOrganism }): JSX.Element {
    return (
        <>
            {organism.segments.map((segment, index) =>
                segment.italic ? (
                    <i key={index}>{segment.text}</i>
                ) : (
                    <span key={index}>{segment.text}</span>
                )
            )}
        </>
    );
}

/**
 * The organisms with a typing chart, all drawn from the typing subgroups:
 * Salmonella serovars (#1935), Campylobacter species (#1954), Listeria
 * monocytogenes serogroups (#1955), MRSA clonal groups (#1956) and
 * Enterococcus species (#1957).
 */
const CHARTED_ORGANISMS = [
    "Salmonella spp.",
    "Campylobacter spp.",
    "Listeria monocytogenes",
    "MRSA",
    "Enterococcus spp.",
];
const YEAR_PARAM = "year";
/**
 * Repeated once per ticked combination; absent means every combination, and
 * a single empty value means none ("Deselect all").
 */
const COMBINATION_PARAM = "combination";

/** As on the chart's axis, without the N. */
function combinationName(combination: SerovarCombination): string {
    return `${combination.sampleOrigin}, ${combination.matrix}, ${combination.samplingStage}`;
}

function InfoButton({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}): JSX.Element {
    return (
        <Tooltip title={label}>
            <IconButton size="small" aria-label={label} onClick={onClick}>
                <InfoIcon />
            </IconButton>
        </Tooltip>
    );
}

/** The picker's first entry, which ticks or unticks every combination. */
const SELECT_ALL = "__all__";

/** The N after a combination's name. */
const Muted = styled("span")`
    color: #888;
`;

/**
 * Typing subgroups per combination, as 100 % stacked bars: Salmonella
 * serovars, Campylobacter species or Listeria serogroups.
 */
function SerovarSection({
    organism,
    rows,
    onInfo,
}: {
    organism: string;
    rows: TypingResult[];
    onInfo: (labelKey: string) => void;
}): JSX.Element | null {
    const { t } = useTranslation(["MicrobialTyping"]);
    const location = useLocation();
    const history = useHistory();

    const years = samplingYears(rows);
    if (years.length === 0) return null;
    // Like the microorganism, the year lives in the URL so links can share it;
    // a missing or unknown year falls back to the latest.
    const requested = Number(
        new URLSearchParams(location.search).get(YEAR_PARAM)
    );
    const year = years.includes(requested) ? requested : years[0];

    const chart = buildSerovarChart(rows, year, organism);
    // picker order: plotted combinations, then those under the minimum N
    const entries: SerovarCombination[] = [
        ...chart.bars,
        ...chart.belowMinimum,
    ];
    // Only plotted combinations can be picked; those under the minimum N are
    // listed for information, as ticking them could never add a bar.
    const allKeys = chart.bars.map((bar) => bar.key);
    // Like the year, the ticked combinations live in the URL; a pick that
    // matches none of the year's combinations falls back to all of them.
    const requestedKeys = new URLSearchParams(location.search).getAll(
        COMBINATION_PARAM
    );
    const picked = requestedKeys.filter((key) => allKeys.includes(key));
    const noneRequested =
        requestedKeys.length > 0 && requestedKeys.every((key) => key === "");
    const shownKeys = noneRequested ? [] : picked.length > 0 ? picked : allKeys;
    const allShown = shownKeys.length === allKeys.length;
    const shownChart = {
        ...chart,
        bars: chart.bars.filter((bar) => shownKeys.includes(bar.key)),
    };

    const handleYear = (value: string): void => {
        const params = new URLSearchParams(location.search);
        params.set(YEAR_PARAM, value);
        params.delete(COMBINATION_PARAM);
        history.replace({ search: `?${params.toString()}` });
    };

    const handleCombinations = (keys: string[]): void => {
        const params = new URLSearchParams(location.search);
        params.delete(COMBINATION_PARAM);
        if (keys.length === 0) {
            params.append(COMBINATION_PARAM, "");
        } else if (keys.length < allKeys.length) {
            keys.forEach((key) => params.append(COMBINATION_PARAM, key));
        }
        history.replace({ search: `?${params.toString()}` });
    };

    return (
        <>
            <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel id="typing-sampling-year">
                        {t("SamplingYear")}
                    </InputLabel>
                    <Select
                        labelId="typing-sampling-year"
                        value={year}
                        label={t("SamplingYear")}
                        onChange={(event) =>
                            handleYear(String(event.target.value))
                        }
                    >
                        {years.map((y) => (
                            <MenuItem key={y} value={y}>
                                {y}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <InfoButton
                    label={t("More Info on Sampling Year")}
                    onClick={() => onInfo("SamplingYear")}
                />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                <FormControl sx={{ width: 520, maxWidth: "100%" }}>
                    <InputLabel id="typing-combinations">
                        {t("Combinations")}
                    </InputLabel>
                    <Select
                        labelId="typing-combinations"
                        multiple
                        value={shownKeys}
                        label={t("Combinations")}
                        onChange={(event) => {
                            const value = event.target.value;
                            const keys =
                                typeof value === "string"
                                    ? value.split(",")
                                    : value;
                            if (keys.includes(SELECT_ALL)) {
                                handleCombinations(allShown ? [] : allKeys);
                                return;
                            }
                            handleCombinations(keys);
                        }}
                        renderValue={(keys) =>
                            entries
                                .filter((entry) => keys.includes(entry.key))
                                .map(combinationName)
                                .join(", ")
                        }
                        MenuProps={{
                            PaperProps: { style: { maxHeight: 400 } },
                        }}
                    >
                        <MenuItem value={SELECT_ALL}>
                            <Checkbox
                                checked={allShown}
                                indeterminate={
                                    shownKeys.length > 0 && !allShown
                                }
                            />
                            <ListItemText
                                primary={
                                    allShown
                                        ? t("DESELECT_ALL")
                                        : t("SELECT_ALL")
                                }
                            />
                        </MenuItem>
                        {entries.map((entry) => {
                            const plotted = allKeys.includes(entry.key);
                            return (
                                <MenuItem
                                    key={entry.key}
                                    value={entry.key}
                                    disabled={!plotted}
                                >
                                    {plotted && (
                                        <Checkbox
                                            checked={shownKeys.includes(
                                                entry.key
                                            )}
                                        />
                                    )}
                                    <ListItemText
                                        primary={
                                            <>
                                                {combinationName(entry)}
                                                <Muted>
                                                    {plotted
                                                        ? ` (N=${entry.n})`
                                                        : ` (N=${entry.n}, ${t(
                                                              "data_not_plotted"
                                                          )})`}
                                                </Muted>
                                            </>
                                        }
                                    />
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                <InfoButton
                    label={t("More Info on Combinations")}
                    onClick={() => onInfo("Combinations")}
                />
            </Stack>
            {/* Remount per year and search: Recharts would keep the old
                bars' ticks and tooltip. */}
            <SerovarBarChart
                key={`${year}|${shownChart.bars
                    .map((bar) => bar.key)
                    .join("/")}`}
                chart={shownChart}
                organism={organism}
            />
        </>
    );
}

// MainWithSideLayout's content card clips and centres; the typing content
// scrolls itself and reads left-aligned, as the prevalence results do.
const DetailContent = styled(Content)`
    height: calc(100vh - 150px);
    overflow-y: auto;
    text-align: left;
`;

// The explanation box below the graph, styled as on the AMR pages.
const InfoBlock = styled("section")`
    margin: 24px 0;
    padding: 24px;
    border-radius: 8px;
    background-color: #f6f7fa;
`;

const InfoTitle = styled(Typography)`
    color: #003663;
`;

const Breadcrumb = styled("nav")`
    margin-bottom: 1rem;
    font-size: 1.1rem;
`;

const BreadcrumbLink = styled("button")`
    padding: 0;
    border: 0;
    background: none;
    color: ${primaryColor};
    font-family: inherit;
    font-size: inherit;
    text-decoration: underline;
    cursor: pointer;
`;

/** The CMS locale matching the page language. */
function useCmsLocale(): "de" | "en" {
    const { i18n } = useTranslation(["MicrobialTyping"]);
    return (i18n.language || "en").toLowerCase().startsWith("de") ? "de" : "en";
}

/**
 * One microorganism: its Search Options beside its typing chart (#1948),
 * as the AMR pages open a graph after the microorganism is chosen.
 */
function TypingDetail({
    organism,
    onBack,
}: {
    organism: TypingOrganism;
    onBack: () => void;
}): JSX.Element {
    const { t } = useTranslation(["MicrobialTyping"]);
    const locale = useCmsLocale();
    const location = useLocation();
    const history = useHistory();
    const [rows, setRows] = useState<TypingResult[] | null>(null);
    const [failed, setFailed] = useState(false);
    // The chart shows the applied search (the URL's); the panel edits a
    // pending copy that Search applies, as on the AMR trend page.
    const applied = readTypingSelection(new URLSearchParams(location.search));
    const [selection, setSelection] = useState<TypingSelection>(applied);
    const [info, setInfo] = useState<{ title: string; content: string } | null>(
        null
    );
    const [typingInfo, setTypingInfo] = useState<{
        title: string;
        description: string;
    } | null>(null);

    // The info icons explain a filter with the CMS `information` entry titled
    // like the filter's label, as on the AMR trend page.
    const showInfo = async (labelKey: string): Promise<void> => {
        const url =
            `${INFORMATION}?filters[title][$eqi]=${encodeURIComponent(
                t(labelKey)
            )}` + `&locale=${locale}&pagination[pageSize]=1`;
        try {
            const res = await callApiService<{
                data?: { title: string; content: string }[];
            }>(url);
            const entry = res.data?.data?.[0];
            if (entry) setInfo({ title: entry.title, content: entry.content });
        } catch (err) {
            console.error("Failed to fetch information:", err);
        }
    };

    const applySelection = (next: TypingSelection): void => {
        const params = new URLSearchParams(location.search);
        writeTypingSelection(params, next);
        // a new search starts again from every combination
        params.delete(COMBINATION_PARAM);
        history.replace({ search: `?${params.toString()}` });
    };

    // The explanation below the graph, edited in the CMS as on the AMR pages.
    useEffect(() => {
        let cancelled = false;
        const load = async (): Promise<void> => {
            try {
                const res = await callApiService<{
                    data?: { title?: string; description?: string };
                }>(`${TYPING_INFORMATION}?locale=${locale}`);
                const data = res.data?.data;
                if (cancelled) return;
                // an unpublished single type has nothing to show
                setTypingInfo(
                    data?.title || data?.description
                        ? {
                              title: data.title ?? "",
                              description: data.description ?? "",
                          }
                        : null
                );
            } catch (err) {
                console.error("Failed to fetch typing information", err);
                if (!cancelled) setTypingInfo(null);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [locale]);

    useEffect(() => {
        let cancelled = false;
        setRows(null);
        setFailed(false);
        const load = async (): Promise<void> => {
            try {
                const result = await fetchTypingResults(organism, locale);
                if (!cancelled) setRows(result);
            } catch {
                if (!cancelled) setFailed(true);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [organism, locale]);

    return (
        <>
            <MainWithSideLayout
                sidebarTitle={t("SearchOptions")}
                side={
                    <TypingSearchOptions
                        options={typingFilterOptions(rows ?? [], selection)}
                        selection={selection}
                        onChange={setSelection}
                        onSearch={() => applySelection(selection)}
                        onReset={() => {
                            setSelection(emptyTypingSelection);
                            applySelection(emptyTypingSelection);
                        }}
                        onInfo={(labelKey) => void showInfo(labelKey)}
                    />
                }
                main={
                    <DetailContent>
                        <Breadcrumb aria-label={t("Breadcrumb")}>
                            <BreadcrumbLink type="button" onClick={onBack}>
                                {t("Title")}
                            </BreadcrumbLink>
                            {" / "}
                            <OrganismName organism={organism} />
                        </Breadcrumb>
                        <Title>
                            {t("Title")}: <OrganismName organism={organism} />
                        </Title>
                        {failed && <p role="alert">{t("LoadError")}</p>}
                        {rows &&
                            (CHARTED_ORGANISMS.includes(organism.id) ? (
                                <>
                                    <SerovarSection
                                        organism={organism.id}
                                        rows={filterTypingRows(rows, applied)}
                                        onInfo={(labelKey) =>
                                            void showInfo(labelKey)
                                        }
                                    />
                                    {typingInfo && (
                                        <InfoBlock data-testid="typing-information">
                                            <InfoTitle
                                                variant="h6"
                                                gutterBottom
                                            >
                                                {typingInfo.title}
                                            </InfoTitle>
                                            <Markdown
                                                options={{ forceBlock: true }}
                                            >
                                                {typingInfo.description}
                                            </Markdown>
                                        </InfoBlock>
                                    )}
                                </>
                            ) : (
                                <p>{t("NoChartYet")}</p>
                            ))}
                    </DetailContent>
                }
            />
            <Dialog open={info !== null} onClose={() => setInfo(null)}>
                <DialogTitle>{info?.title}</DialogTitle>
                <DialogContent>
                    <Markdown>{info?.content ?? ""}</Markdown>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInfo(null)}>{t("Close")}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export function MicrobialTypingPageComponent(): JSX.Element {
    const { t } = useTranslation(["MicrobialTyping"]);
    const location = useLocation();
    const history = useHistory();

    // The URL is the single source of truth for the selection, so a shared
    // link opens on the same microorganism; without a known one, the list.
    const selected = TYPING_ORGANISMS.find(
        (organism) =>
            organism.id ===
            new URLSearchParams(location.search).get(MICROORGANISM_PARAM)
    );

    // Start from the live query so the `lang` parameter is preserved.
    const handleSelect = (organism: TypingOrganism): void => {
        const params = new URLSearchParams(location.search);
        params.set(MICROORGANISM_PARAM, organism.id);
        history.push({ search: `?${params.toString()}` });
    };

    const handleBack = (): void => {
        const params = new URLSearchParams();
        const lang = new URLSearchParams(location.search).get("lang");
        if (lang) params.set("lang", lang);
        history.push({ search: `?${params.toString()}` });
    };

    if (selected) {
        return (
            <PageLayoutComponent>
                <TypingDetail
                    key={selected.id}
                    organism={selected}
                    onBack={handleBack}
                />
            </PageLayoutComponent>
        );
    }

    return (
        <PageLayoutComponent>
            <Page>
                <Sidebar aria-label={t("SelectMicroorganism")}>
                    <NavList>
                        {TYPING_ORGANISMS.map((organism) => (
                            <li key={organism.id}>
                                <NavItem
                                    type="button"
                                    active={false}
                                    onClick={() => handleSelect(organism)}
                                >
                                    <OrganismName organism={organism} />
                                </NavItem>
                            </li>
                        ))}
                    </NavList>
                </Sidebar>

                <Content>
                    <Title>{t("Title")}</Title>
                </Content>
            </Page>
        </PageLayoutComponent>
    );
}
