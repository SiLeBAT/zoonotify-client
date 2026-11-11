// The Link Finder against the CMS public API. Requests carry only official filter values and
// collection names, never the visitor's search text.
import { MINIMUM_N } from "../antibiotic_resistance/pages/resistanceHelpers";
import { DataIndex, Dim, LinkSpec, OfficialNames, ValuePair } from "./model";

type Fetch = typeof fetch;

const PAGE_SIZE = 100;
/** A CMS that does not answer within this many milliseconds counts as unavailable. */
export const CMS_TIMEOUT_MS = 10000;

/** Dimension (as the pages' URL keys name it) -> CMS collection. */
const VALUE_COLLECTIONS: { [dim: string]: string } = {
    microorganism: "microorganisms",
    specie: "species",
    sampleType: "sample-types",
    superCategorySampleOrigin: "super-category-sample-origins",
    sampleOrigin: "sample-origins",
    samplingStage: "sampling-stages",
    matrixGroup: "matrix-groups",
    matrix: "matrices",
    antimicrobialSubstance: "antimicrobial-substances",
};

interface StrapiPage<T> {
    data: T[];
    meta?: { pagination?: { pageCount?: number; total?: number } };
}

async function getJson<T>(fetchFn: Fetch, url: string): Promise<T> {
    const controller =
        typeof AbortController !== "undefined"
            ? new AbortController()
            : undefined;
    const timer = setTimeout(() => controller?.abort(), CMS_TIMEOUT_MS);
    try {
        const res = await fetchFn(url, {
            headers: { Accept: "application/json" },
            signal: controller?.signal,
        });
        if (!res.ok) throw new Error(`CMS request failed: ${res.status}`);
        return (await res.json()) as T;
    } finally {
        clearTimeout(timer);
    }
}

async function fetchAll<T>(
    fetchFn: Fetch,
    apiBase: string,
    collection: string,
    params: { [key: string]: string }
): Promise<T[]> {
    const rows: T[] = [];
    let page = 1;
    let pageCount = 1;
    do {
        const q = new URLSearchParams(params);
        q.set("pagination[pageSize]", String(PAGE_SIZE));
        q.set("pagination[page]", String(page));
        const body = await getJson<StrapiPage<T>>(
            fetchFn,
            `${apiBase}/${collection}?${q.toString()}`
        );
        rows.push(...body.data);
        pageCount = body.meta?.pagination?.pageCount ?? 1;
        page += 1;
    } while (page <= pageCount);
    return rows;
}

interface NamedRow {
    documentId: string;
    name: string;
}

/** Both locales of one value collection, joined by documentId (the pattern of zoonotify-mcp). */
async function valuePairs(
    fetchFn: Fetch,
    apiBase: string,
    collection: string
): Promise<ValuePair[]> {
    const [en, de] = await Promise.all(
        ["en", "de"].map((locale) =>
            fetchAll<NamedRow>(fetchFn, apiBase, collection, {
                locale,
                "fields[0]": "name",
            })
        )
    );
    const deById = new Map(de.map((r) => [r.documentId, r.name]));
    return en.map((r) => ({
        en: r.name,
        de: deById.get(r.documentId) ?? r.name,
    }));
}

interface AntibioticRow {
    shortName: string;
    name: string;
}

interface ResistanceTableRow {
    cut_offs?: {
        substanzklasse?: string | null;
        antibiotic?: { shortName?: string } | null;
    }[];
}

/** Substance names (German) and classes, following the German CMS cut-off grouping. */
async function substances(
    fetchFn: Fetch,
    apiBase: string
): Promise<OfficialNames["substances"]> {
    const [antibiotics, tables] = await Promise.all([
        fetchAll<AntibioticRow>(fetchFn, apiBase, "antibiotics", {}),
        fetchAll<ResistanceTableRow>(fetchFn, apiBase, "resistance-tables", {
            locale: "de",
            populate: "cut_offs.antibiotic",
        }),
    ]);
    const classByCode = new Map<string, string>();
    for (const t of tables)
        for (const c of t.cut_offs ?? []) {
            const code = c.antibiotic?.shortName;
            if (code && c.substanzklasse)
                classByCode.set(code, c.substanzklasse);
        }
    return antibiotics.map((a) => ({
        code: a.shortName,
        nameDe: a.name,
        classDe: classByCode.get(a.shortName) ?? null,
    }));
}

/** Official names from both CMS locales. `apiBase` like "https://zoonotify.bfr.berlin/cms/api". */
export function cmsOfficialNames(
    apiBase: string,
    fetchFn: Fetch = (...args) => fetch(...args)
): () => Promise<OfficialNames> {
    const base = apiBase.replace(/\/+$/, "");
    return async () => {
        const dims = Object.keys(VALUE_COLLECTIONS);
        const [pairs, subs] = await Promise.all([
            Promise.all(
                dims.map((d) => valuePairs(fetchFn, base, VALUE_COLLECTIONS[d]))
            ),
            substances(fetchFn, base),
        ]);
        const values: OfficialNames["values"] = {};
        dims.forEach((d, i) => {
            values[d] = pairs[i];
        });
        return { values, substances: subs };
    };
}

/** The CMS collection a link's graph reads. */
function collectionOf(link: LinkSpec): string {
    if (link.page !== "amr") return "prevalences";
    return link.view === "multi" ? "multi-resistances" : "resistances";
}

/**
 * "Does this link have data?" as a one-row count read against the CMS. An AMR link counts
 * only rows the AMR graphs would draw, with at least `MINIMUM_N` tested isolates (the Multi-
 * resistance graph reads `multi-resistances`, with the same minimum).
 */
export function cmsDataIndex(
    apiBase: string,
    fetchFn: Fetch = (...args) => fetch(...args)
): DataIndex {
    const base = apiBase.replace(/\/+$/, "");
    return {
        async newestYear(link: LinkSpec): Promise<number | undefined> {
            const q = new URLSearchParams();
            q.set("locale", "en");
            q.set("pagination[pageSize]", "1");
            q.set("fields[0]", "samplingYear");
            q.set("sort", "samplingYear:desc");
            if (link.page === "amr")
                q.set(
                    "filters[anzahlGetesteterIsolate][$gte]",
                    String(MINIMUM_N)
                );
            (link.years ?? []).forEach((y, i) =>
                q.set(`filters[samplingYear][$in][${i}]`, String(y))
            );
            for (const dim of Object.keys(link.filters) as Dim[])
                (link.filters[dim] ?? []).forEach((v, i) =>
                    q.set(`filters[${dim}][name][$in][${i}]`, v)
                );
            const body = await getJson<StrapiPage<{ samplingYear: number }>>(
                fetchFn,
                `${base}/${collectionOf(link)}?${q.toString()}`
            );
            const total = body.meta?.pagination?.total ?? body.data.length;
            return total > 0 && body.data.length
                ? body.data[0].samplingYear
                : undefined;
        },
    };
}
