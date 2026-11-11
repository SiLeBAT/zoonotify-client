// The Link Finder facade: search text + language + data index in, checked links out.
// Nothing here sends the search text anywhere; the data index sees only built links.
import {
    candidates,
    checkLinks,
    dedupeByUrl,
    organismChoices,
    organismLabel,
    pageLinks,
    toFound,
} from "./links";
import { parse, Parsed } from "./match";
import {
    DataIndex,
    EnglishSubstanceNames,
    EverydayWord,
    FoundLink,
    Lang,
    LinkFinderResult,
    OfficialNames,
} from "./model";
import { buildWordList, WordList } from "./wordList";
import everydayWords from "./wordList/everyday-words.json";
import englishSubstanceNames from "./wordList/substance-names-en.json";

export const SHOWN_LINKS = 3;

/** Thrown by `find` when the official names could not be loaded. */
export class LinkFinderUnavailableError extends Error {
    constructor(cause: unknown) {
        super(
            `Link Finder word list unavailable: ${
                cause instanceof Error ? cause.message : String(cause)
            }`
        );
        this.name = "LinkFinderUnavailableError";
        // ES5 target: keep instanceof working on a subclassed Error.
        Object.setPrototypeOf(this, LinkFinderUnavailableError.prototype);
    }
}

/** Page words alone ("evaluations") name a page; any filter or year means a data search. */
function namesPagesOnly(parsed: Parsed, organism?: string): boolean {
    return (
        parsed.pageLinks.length > 0 &&
        !organism &&
        Object.keys(parsed.filters).length === 0 &&
        parsed.years.length === 0
    );
}

/** A resistance search that names no organism: ask which one, never fall back to prevalence. */
function needsOrganism(parsed: Parsed): boolean {
    return (
        parsed.page === "amr" &&
        !parsed.filters.microorganism &&
        !parsed.filters.specie
    );
}

/**
 * Whether a checked link is worth showing. A closest (relaxed) link is kept only for what the
 * search asked for: prevalence, the Substance graph, or the trend view when a trend word was
 * used. The Multi-resistance graph is never asked for by a word, so it has no closest version.
 */
function isWorthShowing(link: FoundLink, parsed: Parsed): boolean {
    return (
        !link.closest ||
        link.view === "substance" ||
        link.page === "prevalence" ||
        (link.view === "trend" && parsed.trend)
    );
}

export interface LinkFinder {
    /** `organism` (English official name, from `chooseOrganism`) is added to what the text names. */
    find(
        text: string,
        lang: Lang,
        index: DataIndex,
        organism?: string
    ): Promise<LinkFinderResult>;
}

export interface LinkFinderTables {
    everydayWords?: EverydayWord[];
    englishSubstanceNames?: EnglishSubstanceNames;
}

/**
 * Builds a Link Finder over a source of official names. The source is called on the first
 * search and its word list kept; a failed load is retried on the next search.
 */
export function createLinkFinder(
    officialNames: () => Promise<OfficialNames>,
    tables: LinkFinderTables = {}
): LinkFinder {
    const everyday =
        tables.everydayWords ?? (everydayWords as unknown as EverydayWord[]);
    const english = tables.englishSubstanceNames ?? englishSubstanceNames;
    let wordList: Promise<WordList> | undefined;

    function load(): Promise<WordList> {
        if (!wordList)
            wordList = officialNames().then(
                (names) => buildWordList(names, everyday, english),
                (err: unknown) => {
                    wordList = undefined;
                    throw new LinkFinderUnavailableError(err);
                }
            );
        return wordList;
    }

    return {
        async find(text, lang, index, organism) {
            const list = await load();
            const parsed = parse(list, text);
            // Page words alone ("evaluations") name a page; filters mean a data search.
            if (namesPagesOnly(parsed, organism))
                return {
                    links: pageLinks(list, parsed, lang).slice(0, SHOWN_LINKS),
                    unmatched: parsed.unmatched,
                };
            if (organism)
                parsed.filters.microorganism = [
                    organism,
                    ...(parsed.filters.microorganism ?? []).filter(
                        (o) => o !== organism
                    ),
                ];
            if (needsOrganism(parsed)) {
                const choices = await organismChoices(list, parsed, index);
                if (!choices.length)
                    return {
                        links: [],
                        unmatched: parsed.unmatched,
                        noResistanceData: true,
                    };
                return {
                    links: [],
                    unmatched: parsed.unmatched,
                    chooseOrganism: choices.map((o) => ({
                        organism: o,
                        label: organismLabel(list, o, lang),
                    })),
                };
            }
            let checked = await checkLinks(candidates(list, parsed), index);
            // Only an organism named: prevalence first, then resistance; and
            // resistance alone when no prevalence link has data.
            if (parsed.bothPages)
                checked = checked.concat(
                    await checkLinks(
                        candidates(list, { ...parsed, page: "amr" }),
                        index
                    )
                );
            // Nothing on the resistance page: try prevalence.
            else if (!checked.length && parsed.page === "amr")
                checked = await checkLinks(
                    candidates(list, { ...parsed, page: "prevalence" }),
                    index
                );
            return {
                links: dedupeByUrl(
                    checked
                        .map((l) => toFound(list, l, lang))
                        .filter((l) => isWorthShowing(l, parsed))
                ).slice(0, SHOWN_LINKS),
                unmatched: parsed.unmatched,
            };
        },
    };
}
