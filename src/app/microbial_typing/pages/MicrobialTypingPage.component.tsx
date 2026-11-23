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
} from "@mui/material";
import Markdown from "markdown-to-jsx";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { INFORMATION } from "../../shared/infrastructure/router/routes";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";
import { SidebarComponent } from "../../shared/components/layout/SidebarComponent";
import { primaryColor } from "../../shared/style/Style-MainTheme";
import {
    MICROORGANISM_PARAM,
    TYPING_ORGANISMS,
    TypingOrganism,
} from "./typingOrganisms";
import { fetchTypingResults, samplingYears, TypingResult } from "./typingData";
import { buildSerovarChart } from "./serovarChart";
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

/** The only organism with a typing chart so far (#1935). */
const SEROVAR_ORGANISM = "Salmonella spp.";
const YEAR_PARAM = "year";

const YearLabel = styled("label")`
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    font-weight: bold;
`;

const YearSelect = styled("select")`
    padding: 0.4rem 0.6rem;
    border: 1px solid ${primaryColor};
    border-radius: 4px;
    background: #fff;
    color: ${primaryColor};
    font-family: inherit;
    font-size: 1rem;
`;

/** Salmonella serovars per combination, as 100 % stacked bars. */
function SerovarSection({
    rows,
}: {
    rows: TypingResult[];
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

    const chart = buildSerovarChart(rows, year);

    const handleYear = (value: string): void => {
        const params = new URLSearchParams(location.search);
        params.set(YEAR_PARAM, value);
        history.replace({ search: `?${params.toString()}` });
    };

    return (
        <>
            <YearLabel>
                {t("SamplingYear")}
                <YearSelect
                    value={year}
                    onChange={(event) => handleYear(event.target.value)}
                >
                    {years.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </YearSelect>
            </YearLabel>
            {/* Remount per year and search: Recharts would keep the old
                bars' ticks and tooltip. */}
            <SerovarBarChart
                key={`${year}|${chart.bars.map((bar) => bar.key).join("/")}`}
                chart={chart}
            />
        </>
    );
}

// Like the AMR and prevalence pages: fill the scroll area PageLayoutComponent's
// <main> hands down and clip, so the side panel and the content each scroll
// themselves instead of <main> adding a second scrollbar.
const DetailLayout = styled("div")`
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
`;

const DetailContent = styled(Content)`
    overflow-y: auto;
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
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [info, setInfo] = useState<{ title: string; content: string } | null>(
        null
    );

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
        history.replace({ search: `?${params.toString()}` });
    };

    useEffect(() => {
        let cancelled = false;
        setRows(null);
        setFailed(false);
        const load = async (): Promise<void> => {
            try {
                const result = await fetchTypingResults(organism.id, locale);
                if (!cancelled) setRows(result);
            } catch {
                if (!cancelled) setFailed(true);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [organism.id, locale]);

    return (
        <DetailLayout>
            <SidebarComponent
                isOpen={isPanelOpen}
                handleOpenClick={() => setIsPanelOpen(!isPanelOpen)}
                title={t("SearchOptions")}
            >
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
            </SidebarComponent>
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
                    (organism.id === SEROVAR_ORGANISM ? (
                        <SerovarSection
                            rows={filterTypingRows(rows, applied)}
                        />
                    ) : (
                        <p>{t("NoChartYet")}</p>
                    ))}
            </DetailContent>
            <Dialog open={info !== null} onClose={() => setInfo(null)}>
                <DialogTitle>{info?.title}</DialogTitle>
                <DialogContent>
                    <Markdown>{info?.content ?? ""}</Markdown>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInfo(null)}>{t("Close")}</Button>
                </DialogActions>
            </Dialog>
        </DetailLayout>
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
