// The Link Finder facade: search text + language + data index in, checked links out.
// Nothing here sends the search text anywhere; the data index sees only built links.
import { candidates, checkLinks, toFound } from "./links";
import { parse } from "./match";
import {
    DataIndex,
    EnglishSubstanceNames,
    EverydayWord,
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

export interface LinkFinder {
    find(text: string, lang: Lang, index: DataIndex): Promise<LinkFinderResult>;
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
        async find(text, lang, index) {
            const list = await load();
            const parsed = parse(list, text);
            let checked = await checkLinks(candidates(parsed), index);
            // Nothing on the resistance page: try prevalence.
            if (!checked.length && parsed.page === "amr")
                checked = await checkLinks(
                    candidates({ ...parsed, page: "prevalence" }),
                    index
                );
            return {
                links: checked
                    .slice(0, SHOWN_LINKS)
                    .map((l) => toFound(list, l, lang)),
                unmatched: parsed.unmatched,
            };
        },
    };
}
