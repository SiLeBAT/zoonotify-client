// Types of the Link Finder (terms: docs/context/link-finder.md in the monorepo).

export type Lang = "en" | "de";
export type Page = "prevalence" | "amr";
export type AmrView = "substance" | "trend" | "multi";
/** A data page that has no filters the Link Finder sets: linked by name only. */
export type PageLinkId = "antimicrobialUse" | "microbialCounts" | "evaluations";

/** Filter dimensions, named as the pages' URLs name them. Values are English official names, substances by code. */
export type Dim =
    | "microorganism"
    | "specie"
    | "superCategorySampleOrigin"
    | "sampleOrigin"
    | "samplingStage"
    | "matrixGroup"
    | "matrix"
    | "antimicrobialSubstance";

/** Broadest first: when one name exists in two dimensions, the earlier one wins. */
export const DIMS: Dim[] = [
    "microorganism",
    "specie",
    "superCategorySampleOrigin",
    "sampleOrigin",
    "samplingStage",
    "matrixGroup",
    "matrix",
    "antimicrobialSubstance",
];

export type Filters = { [D in Dim]?: string[] };

/** The English and German official names of one value. */
export interface ValuePair {
    en: string;
    de: string;
}

/** The official names, as fetched from both CMS locales and joined by documentId. */
export interface OfficialNames {
    /** Per dimension (plus `sampleType`, understood but never linked). */
    values: { [dim: string]: ValuePair[] };
    substances: { code: string; nameDe: string; classDe: string | null }[];
}

/** One row of the everyday-words table: one meaning. */
export interface EverydayWord {
    id: string;
    category: string;
    en: string[];
    de: string[];
    /** Values it sets: substances by code, every other value by English official name. */
    sets?: Filters;
    page?: Page;
    view?: AmrView;
    /** The word names one of the other data pages. */
    pageLink?: PageLinkId;
}

/** English drug names, by substance code. */
export type EnglishSubstanceNames = { [code: string]: string };

/** A link before it becomes a URL. */
export interface LinkSpec {
    page: Page;
    view?: AmrView;
    /** Set on a link that only opens a named page; `page` and `filters` are then placeholders. */
    pageLink?: PageLinkId;
    filters: Filters;
    years?: number[];
    /** The search asked for the latest year; `years` is resolved from the data. */
    latest?: boolean;
    /** The link drops something the search asked for, to avoid an empty page. */
    closest?: boolean;
    /** What a closest link dropped: the values the search asked for, English official names. */
    without?: { dim: Dim | "samplingYear"; values: string[] }[];
}

/** What a link opens: its page and, on the AMR page, its graph. */
export type LinkKind =
    | "prevalence"
    | "amrSubstance"
    | "amrTrend"
    | "amrMulti"
    | PageLinkId;

export function linkKind(link: LinkSpec): LinkKind {
    if (link.pageLink) return link.pageLink;
    if (link.page === "prevalence") return "prevalence";
    if (link.view === "trend") return "amrTrend";
    return link.view === "multi" ? "amrMulti" : "amrSubstance";
}

/** One filter of a link, as the visitor reads it. */
export interface FilterLabel {
    dim: Dim | "samplingYear";
    text: string;
}

export interface FoundLink extends LinkSpec {
    /** Site-relative URL carrying `?lang=`. */
    url: string;
    /** One label per filter value set, in the link's language. */
    labels: FilterLabel[];
    /** What a closest link dropped, one label per value, in the link's language; empty for an exact link. */
    dropped: FilterLabel[];
}

/** An organism the visitor may pick when a resistance search names none. */
export interface OrganismChoice {
    /** English official name: pass it back to `find`. */
    organism: string;
    /** Official name in the search's language. */
    label: string;
}

export interface LinkFinderResult {
    /** At most three, each confirmed to have data. */
    links: FoundLink[];
    /** Words that matched nothing, as typed. */
    unmatched: string[];
    /**
     * Set, with `links` empty, when a resistance search names no organism: the organisms with
     * data for its other filters. Re-run `find` with one of them to get its links.
     */
    chooseOrganism?: OrganismChoice[];
    /**
     * Set, with `links` empty, when a resistance search names no organism and no organism has
     * resistance data for its other filters. No prevalence links are offered instead.
     */
    noResistanceData?: true;
}

/** Answers "would this link draw something?" without ever seeing the search text. */
export interface DataIndex {
    /** Newest year with data for this link, or undefined when it has none. */
    newestYear(link: LinkSpec): Promise<number | undefined>;
}
