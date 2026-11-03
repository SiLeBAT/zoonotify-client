import LZString from "lz-string";

/**
 * Reading the welcome page's example queries the way the client does, so each
 * filter value can be checked against live data before the link is opened.
 * The client silently drops a value it cannot resolve and shows a broader (or
 * empty) result, so an unresolved value is the defect to report.
 */

export type Lang = "de" | "en";

export interface FilterValue {
    key: string;
    value: string;
}

export interface ExampleQuery {
    kind: "prevalence" | "amr";
    /** Language the client will resolve names in (the link's own, else fallback). */
    lang: Lang;
    /** The microorganism the page is about: UI name for AMR, lookup value for prevalence. */
    organism?: string;
    filters: FilterValue[];
}

/** Prevalence URL keys whose values are names or documentIds of lookup entries. */
const PREVALENCE_LOOKUP_KEYS = [
    "microorganism",
    "sampleOrigin",
    "matrix",
    "samplingStage",
    "matrixGroup",
    "superCategorySampleOrigin",
] as const;

/** AMR filter keys (comma separated in the URL, as the client splits them). */
const AMR_KEYS = [
    "specie",
    "superCategorySampleOrigin",
    "sampleOrigin",
    "samplingStage",
    "matrixGroup",
    "matrix",
    "antimicrobialSubstance",
] as const;

/** Keys inside the compressed `?s=` payload, as in SubstanceDetail. */
const SHORT_KEYS: Record<string, string> = {
    a: "antimicrobialSubstance",
    s: "specie",
    u: "superCategorySampleOrigin",
    o: "sampleOrigin",
    g: "samplingStage",
    mG: "matrixGroup",
    m: "matrix",
};

function asLang(value: string | null | undefined, fallback: Lang): Lang {
    return value === "de" || value === "en" ? value : fallback;
}

/** Decodes the `?s=` state; null when it does not decompress to JSON. */
export function decodeCompressedState(s: string): {
    m?: string;
    l?: string;
    f?: Record<string, string[]>;
} | null {
    try {
        const json = LZString.decompressFromEncodedURIComponent(s);
        return json ? JSON.parse(json) : null;
    } catch {
        return null;
    }
}

/**
 * Parses a welcome link into the filters the client would resolve, or null
 * when it is not a prevalence / antibiotic-resistance query.
 */
export function parseExampleQuery(
    href: string,
    fallbackLang: Lang
): ExampleQuery | null {
    let url: URL;
    try {
        url = new URL(href);
    } catch {
        return null;
    }
    const params = url.searchParams;
    const path = url.pathname.replace(/\/+$/, "");

    if (path === "/prevalence") {
        const filters: FilterValue[] = [];
        for (const key of PREVALENCE_LOOKUP_KEYS) {
            for (const value of params.getAll(key)) {
                filters.push({ key, value });
            }
        }
        for (const value of params.getAll("chartMicro")) {
            filters.push({ key: "chartMicro", value });
        }
        return {
            kind: "prevalence",
            lang: asLang(
                params.get("lang") ?? params.get("locale"),
                fallbackLang
            ),
            organism: params.get("microorganism") ?? undefined,
            filters,
        };
    }

    if (path === "/antibiotic-resistance") {
        const s = params.get("s");
        if (s) {
            const state = decodeCompressedState(s);
            if (!state || state.m === undefined) return null;
            const filters: FilterValue[] = [];
            for (const [short, values] of Object.entries(state.f ?? {})) {
                const key = SHORT_KEYS[short];
                if (!key) continue;
                for (const value of values) filters.push({ key, value });
            }
            return {
                kind: "amr",
                lang: asLang(state.l, fallbackLang),
                organism: state.m,
                filters,
            };
        }
        const view = params.get("view");
        const organism = params.get("microorganism");
        if ((view !== "trend" && view !== "substance") || !organism) {
            return null;
        }
        const filters: FilterValue[] = [];
        for (const key of AMR_KEYS) {
            const raw = params.get(key);
            if (!raw) continue;
            for (const value of raw.split(",")) {
                if (value) filters.push({ key, value });
            }
        }
        return {
            kind: "amr",
            lang: asLang(
                params.get("lang") ?? params.get("locale"),
                fallbackLang
            ),
            organism,
            filters,
        };
    }

    return null;
}

export interface LookupEntry {
    name: string;
    documentId: string;
}

/** Live options per filter key; a key with no entry accepts nothing. */
export type Options = Record<string, LookupEntry[]>;

/**
 * Filter values that match no option by name or documentId (the client's
 * resolution rule). `chartMicro` is matched by microorganism name only.
 */
export function unresolvedFilters(
    filters: FilterValue[],
    options: Options
): FilterValue[] {
    return filters.filter(({ key, value }) => {
        if (key === "chartMicro") {
            return !(options.microorganism ?? []).some((o) => o.name === value);
        }
        return !(options[key] ?? []).some(
            (o) => o.name === value || o.documentId === value
        );
    });
}

/**
 * Whether link text names an organism. Accepts the full name, its
 * parenthesised abbreviation ("(MRSA)") or its first word ("Salmonella",
 * "ESBL"), ignoring case; "spp." is not part of the name.
 */
export function textNamesOrganism(text: string, organism: string): boolean {
    const haystack = text.toLowerCase();
    const abbreviation = /\(([^)]+)\)/.exec(organism)?.[1];
    const bare = organism
        .replace(/\([^)]*\)/g, "")
        .replace(/\bspp\.?/gi, "")
        .replace(/\s+/g, " ")
        .trim();
    const firstWord = bare.split(/[\s/-]+/)[0];
    return [abbreviation, bare, firstWord]
        .filter((c): c is string => !!c && c.length >= 3)
        .some((c) => haystack.includes(c.toLowerCase()));
}

/** The same link on the site under test (welcome content points at production). */
export function rebaseToSite(href: string, base: string): string {
    const url = new URL(href);
    const site = new URL(base);
    url.protocol = site.protocol;
    url.host = site.host;
    return url.toString();
}
