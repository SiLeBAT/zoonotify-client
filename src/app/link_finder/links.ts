// Parsed search -> links built by our code from values that exist, checked so none is empty.
import {
    DataIndex,
    Dim,
    FilterLabel,
    Filters,
    FoundLink,
    Lang,
    LinkSpec,
} from "./model";
import { Parsed } from "./match";
import { WordList } from "./wordList";
import {
    AMR_ORGANISMS,
    AMR_ORGANISMS_WITHOUT_DATA,
} from "../antibiotic_resistance/pages/amrOrganisms";
import { encodeSubstanceState } from "../antibiotic_resistance/pages/substanceUrlState";

const PREVALENCE_DIMS: Dim[] = [
    "superCategorySampleOrigin",
    "sampleOrigin",
    "samplingStage",
    "matrixGroup",
    "matrix",
];

/** The genus a species belongs to: a prevalence link names the organism, never the species. */
const GENUS_OF_SPECIE: { [specie: string]: string } = {
    "C. coli": "Campylobacter spp.",
    "C. jejuni": "Campylobacter spp.",
    "Enterococcus faecalis": "Enterococcus spp.",
    "Enterococcus faecium": "Enterococcus spp.",
};

const AMR_DIMS: Dim[] = (["specie", "antimicrobialSubstance"] as Dim[]).concat(
    PREVALENCE_DIMS
);

/** CMS organism names the AMR page labels differently; every other name is its own label. */
const AMR_LABEL_OF_CMS_NAME: { [cms: string]: string } = {
    "Methicillin-resistant Staphylococcus aureus (MRSA)": "MRSA",
    "Shigatoxin-producing E. coli (STEC)": "STEC",
};

/** The AMR page's label for a CMS organism, or undefined when the page does not offer it. */
function amrLabel(cmsName: string): string | undefined {
    const label = AMR_LABEL_OF_CMS_NAME[cmsName] ?? cmsName;
    return AMR_ORGANISMS.indexOf(label) >= 0 ? label : undefined;
}

/** What to give up first when the full link would be empty: the most specific things. */
const RELAX_ORDER: (Dim | "years")[] = [
    "years",
    "samplingStage",
    "matrix",
    "matrixGroup",
    "sampleOrigin",
    "superCategorySampleOrigin",
    "antimicrobialSubstance",
    "specie",
];

function pick(filters: Filters, dims: Dim[]): Filters {
    const out: Filters = {};
    for (const d of dims) {
        const values = filters[d];
        if (values && values.length) out[d] = values.slice();
    }
    return out;
}

/**
 * Whether any value, in either language, contains a comma: the trend view joins its params
 * with commas, so such a value would silently split into others.
 */
function hasComma(list: WordList, filters: Filters): boolean {
    return (Object.keys(filters) as Dim[]).some((d) =>
        (filters[d] ?? []).some(
            (v) =>
                v.indexOf(",") >= 0 ||
                localName(list, d, v, "de").indexOf(",") >= 0
        )
    );
}

/** The organisms a search names, a species standing for its genus. */
function organismsOf(f: Filters): string[] {
    const organisms = (f.microorganism ?? []).slice();
    for (const s of f.specie ?? []) {
        const genus = GENUS_OF_SPECIE[s];
        if (genus && organisms.indexOf(genus) < 0) organisms.push(genus);
    }
    return organisms;
}

/**
 * The links the search asks for, before any data check. Prevalence: one link. AMR: one link
 * per organism the page offers with data, and per species asked for, never a combined one.
 */
export function candidates(list: WordList, parsed: Parsed): LinkSpec[] {
    const f = parsed.filters;
    const years = parsed.years.length ? parsed.years.slice() : undefined;
    const organisms = organismsOf(f);

    if (parsed.page === "prevalence") {
        const filters = pick(f, PREVALENCE_DIMS);
        if (organisms.length) filters.microorganism = organisms;
        if (Object.keys(filters).length === 0 && !years) return [];
        return [{ page: "prevalence", filters, years, latest: parsed.latest }];
    }

    const links: LinkSpec[] = [];
    for (const organism of organisms) {
        const label = amrLabel(organism);
        if (!label || AMR_ORGANISMS_WITHOUT_DATA.has(label)) continue;
        const species = (f.specie ?? []).filter(
            (s) => GENUS_OF_SPECIE[s] === organism
        );
        // Several species asked for together: one link each, never a combined one.
        for (const specie of species.length ? species : [undefined]) {
            const filters = pick(f, AMR_DIMS);
            delete filters.specie;
            if (specie) filters.specie = [specie];
            filters.microorganism = [organism];
            const trend = parsed.trend && !years && !hasComma(list, filters);
            links.push({
                page: "amr",
                view: trend ? "trend" : "substance",
                filters,
                years,
                latest: parsed.latest,
            });
        }
    }
    return links;
}

/**
 * For a resistance search that names no organism: the organisms the AMR page offers whose
 * link, with the search's other filters, has data. English official names, in sidebar order.
 */
export async function organismChoices(
    list: WordList,
    parsed: Parsed,
    index: DataIndex
): Promise<string[]> {
    const offered = Array.from(list.names.microorganism?.keys() ?? [])
        .map((cms) => ({ cms, label: amrLabel(cms) }))
        .filter(
            (o): o is { cms: string; label: string } =>
                !!o.label && !AMR_ORGANISMS_WITHOUT_DATA.has(o.label)
        )
        .sort(
            (a, b) =>
                AMR_ORGANISMS.indexOf(a.label) - AMR_ORGANISMS.indexOf(b.label)
        );
    const found = await Promise.all(
        offered.map(async ({ cms }) => {
            const specs = candidates(list, {
                ...parsed,
                filters: { ...parsed.filters, microorganism: [cms] },
            });
            const years = await Promise.all(
                specs.map((s) => index.newestYear(s))
            );
            return years.some((y) => y !== undefined) ? cms : undefined;
        })
    );
    return found.filter((cms): cms is string => cms !== undefined);
}

function relaxations(link: LinkSpec): LinkSpec[] {
    const out: LinkSpec[] = [];
    for (const what of RELAX_ORDER) {
        if (what === "years") {
            if (link.years || link.latest)
                out.push({
                    ...link,
                    years: undefined,
                    latest: false,
                    closest: true,
                    without: link.years
                        ? [
                              {
                                  dim: "samplingYear",
                                  values: link.years.map(String),
                              },
                          ]
                        : [],
                });
        } else if (link.filters[what]) {
            const filters = { ...link.filters };
            delete filters[what];
            if (Object.keys(filters).length > (link.page === "amr" ? 1 : 0))
                out.push({
                    ...link,
                    filters,
                    closest: true,
                    without: [{ dim: what, values: link.filters[what] ?? [] }],
                });
        }
    }
    return out;
}

/** Keeps links that have data; for an empty one, its nearest relaxations that do. Checks run in parallel. */
export async function checkLinks(
    specs: LinkSpec[],
    index: DataIndex
): Promise<LinkSpec[]> {
    const resolve = (s: LinkSpec, newest: number): LinkSpec =>
        s.latest ? { ...s, years: [newest] } : s;
    const first = await Promise.all(specs.map((s) => index.newestYear(s)));
    const kept: LinkSpec[] = [];
    const empty: LinkSpec[] = [];
    specs.forEach((s, i) => {
        const newest = first[i];
        if (newest === undefined) empty.push(s);
        else kept.push(resolve(s, newest));
    });
    if (!empty.length) return kept;
    const tries = ([] as LinkSpec[]).concat(...empty.map(relaxations));
    const second = await Promise.all(tries.map((s) => index.newestYear(s)));
    tries.forEach((s, i) => {
        const newest = second[i];
        if (newest !== undefined) kept.push(resolve(s, newest));
    });
    return kept;
}

// ---- URLs and labels ----

function localName(list: WordList, dim: Dim, en: string, lang: Lang): string {
    if (lang === "en") return en;
    return list.names[dim]?.get(en) ?? en;
}

/** Prevalence: plain repeated query params, values by their official name in the link's language. */
function prevalenceUrl(list: WordList, link: LinkSpec, lang: Lang): string {
    const q = new URLSearchParams();
    for (const d of Object.keys(link.filters) as Dim[])
        for (const v of link.filters[d] ?? [])
            q.append(d, localName(list, d, v, lang));
    for (const y of link.years ?? []) q.append("samplingYear", String(y));
    q.set("lang", lang);
    return `/prevalence?${q.toString()}`;
}

/** AMR Substance graph: the page's own `?s=` payload, its `l` equal to `?lang=`. */
function substanceUrl(list: WordList, link: LinkSpec, lang: Lang): string {
    const organism = amrLabel((link.filters.microorganism ?? [])[0]) ?? "";
    const selected: { [d: string]: string[] } = {};
    for (const d of Object.keys(link.filters) as Dim[])
        if (d !== "microorganism")
            selected[d] = (link.filters[d] ?? []).map((v) =>
                localName(list, d, v, lang)
            );
    if (link.years) selected.samplingYear = link.years.map(String);
    const s = encodeSubstanceState(
        {
            microorganism: organism,
            selected,
            substanceFilter: selected.antimicrobialSubstance ?? [],
            chartYear:
                link.years && link.years.length === 1
                    ? link.years[0]
                    : undefined,
        },
        lang
    );
    return `/antibiotic-resistance?s=${s}&lang=${lang}`;
}

/** AMR trend view: plain params, several values joined by commas as the view reads them. */
function trendUrl(list: WordList, link: LinkSpec, lang: Lang): string {
    const q = new URLSearchParams();
    q.set(
        "microorganism",
        amrLabel((link.filters.microorganism ?? [])[0]) ?? ""
    );
    q.set("view", "trend");
    for (const d of Object.keys(link.filters) as Dim[])
        if (d !== "microorganism")
            q.set(
                d,
                (link.filters[d] ?? [])
                    .map((v) => localName(list, d, v, lang))
                    .join(",")
            );
    q.set("lang", lang);
    return `/antibiotic-resistance?${q.toString()}`;
}

function buildUrl(list: WordList, link: LinkSpec, lang: Lang): string {
    if (link.page === "prevalence") return prevalenceUrl(list, link, lang);
    if (link.view === "trend") return trendUrl(list, link, lang);
    return substanceUrl(list, link, lang);
}

function buildLabels(
    list: WordList,
    link: LinkSpec,
    lang: Lang
): FilterLabel[] {
    const labels: FilterLabel[] = [];
    for (const d of Object.keys(link.filters) as Dim[])
        for (const v of link.filters[d] ?? [])
            labels.push({ dim: d, text: localName(list, d, v, lang) });
    for (const y of link.years ?? [])
        labels.push({ dim: "samplingYear", text: String(y) });
    return labels;
}

export function organismLabel(list: WordList, cms: string, lang: Lang): string {
    return localName(list, "microorganism", cms, lang);
}

export function toFound(list: WordList, link: LinkSpec, lang: Lang): FoundLink {
    return {
        ...link,
        url: buildUrl(list, link, lang),
        labels: buildLabels(list, link, lang),
        dropped: ([] as FilterLabel[]).concat(
            ...(link.without ?? []).map(({ dim, values }) =>
                values.map((v) => ({
                    dim,
                    text:
                        dim === "samplingYear"
                            ? v
                            : localName(list, dim, v, lang),
                }))
            )
        ),
    };
}

/**
 * One link per URL: two closest links can coincide (sibling species relaxing `specie`).
 * The kept one names everything either dropped.
 */
export function dedupeByUrl(links: FoundLink[]): FoundLink[] {
    const out: FoundLink[] = [];
    const byUrl = new Map<string, FoundLink>();
    for (const link of links) {
        const seen = byUrl.get(link.url);
        if (!seen) {
            const copy = {
                ...link,
                dropped: link.dropped.slice(),
                without: link.without?.slice(),
            };
            byUrl.set(link.url, copy);
            out.push(copy);
            continue;
        }
        for (const d of link.dropped)
            if (!seen.dropped.some((s) => s.dim === d.dim && s.text === d.text))
                seen.dropped.push(d);
        seen.without = (seen.without ?? []).concat(link.without ?? []);
    }
    return out;
}
