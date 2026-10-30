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
 * The links the search asks for, before any data check. This slice builds prevalence links
 * only; a search the matcher sends to the AMR page yields none here, so the finder falls back
 * to prevalence.
 */
export function candidates(parsed: Parsed): LinkSpec[] {
    if (parsed.page !== "prevalence") return [];
    const f = parsed.filters;
    const years = parsed.years.length ? parsed.years.slice() : undefined;
    const organisms = (f.microorganism ?? []).slice();
    for (const s of f.specie ?? []) {
        const genus = GENUS_OF_SPECIE[s];
        if (genus && organisms.indexOf(genus) < 0) organisms.push(genus);
    }
    const filters = pick(f, PREVALENCE_DIMS);
    if (organisms.length) filters.microorganism = organisms;
    if (Object.keys(filters).length === 0 && !years) return [];
    return [{ page: "prevalence", filters, years, latest: parsed.latest }];
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
                });
        } else if (link.filters[what]) {
            const filters = { ...link.filters };
            delete filters[what];
            if (Object.keys(filters).length > (link.page === "amr" ? 1 : 0))
                out.push({ ...link, filters, closest: true });
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
function buildUrl(list: WordList, link: LinkSpec, lang: Lang): string {
    const q = new URLSearchParams();
    for (const d of Object.keys(link.filters) as Dim[])
        for (const v of link.filters[d] ?? [])
            q.append(d, localName(list, d, v, lang));
    for (const y of link.years ?? []) q.append("samplingYear", String(y));
    q.set("lang", lang);
    return `/prevalence?${q.toString()}`;
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

export function toFound(list: WordList, link: LinkSpec, lang: Lang): FoundLink {
    return {
        ...link,
        url: buildUrl(list, link, lang),
        labels: buildLabels(list, link, lang),
    };
}
