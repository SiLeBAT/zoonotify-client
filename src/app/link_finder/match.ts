// Search text -> filter values, page and view, by the word list and code rules alone.
import { Dim, Filters, Page, PageLinkId } from "./model";
import { Meaning, Term, WordList } from "./wordList";
import {
    allowedEdits,
    distance,
    INFLECTIONS,
    LINKERS,
    tokens as split,
} from "./text";

export interface Parsed {
    filters: Filters;
    years: number[];
    latest: boolean;
    trend: boolean;
    page: Page;
    /** No page, view, substance or class word: both pages are worth offering. */
    bothPages: boolean;
    /** Other data pages named by their own words. */
    pageLinks: PageLinkId[];
    /** As typed. */
    unmatched: string[];
}

// Year rules (code, not word list): phrases are folded word sequences.
const LATEST = [
    ["latest"],
    ["most", "recent"],
    ["newest"],
    ["recent"],
    ["last", "year"],
    ["neueste"],
    ["neuesten"],
    ["aktuellste"],
    ["aktuellsten"],
    ["juengste"],
    ["juengsten"],
    ["letzten", "jahr"],
    ["letzte", "jahr"],
    ["letztes", "jahr"],
];
const ALL_YEARS = [
    ["every", "year"],
    ["each", "year"],
    ["all", "years"],
    ["over", "the", "years"],
    ["over", "time"],
    ["across", "all", "years"],
    ["alle", "jahre"],
    ["allen", "jahren"],
    ["ueber", "die", "jahre"],
    ["ueber", "alle", "jahre"],
    ["alle", "verfuegbaren", "jahre"],
    ["im", "zeitverlauf"],
];

// Function words never reported as unmatched. Content words are reported, so a visitor sees
// plainly what the search did not understand.
const STOP = new Set(
    (
        "a an the of in on at to for from by with and or is are was were be been has have had do does did " +
        "what which who how much many show me give list find there any data about into across " +
        "it its this that these those than per one all every each available year years " +
        "der die das den dem des ein eine einer eines einem und oder ist sind war waren wurde wurden " +
        "wie viel viele welche welcher welches was gibt es zu zur zum bei aus von vom im in an auf fuer mit " +
        "ueber zeig zeige mir alle allen jahr jahre jahren hat haben sich verfuegbaren gab dazu " +
        "gegen kommen vor wird werden sein dem dass nach seit bis ich wir sie uns daten hoch " +
        "you your we our can could would should against get"
    ).split(" ")
);

const MAX_WINDOW = 4;

interface Hit {
    start: number;
    length: number;
    edits: number;
    meanings: Meaning[];
}

function phraseAt(tokens: string[], i: number, phrase: string[]): boolean {
    for (let k = 0; k < phrase.length; k++)
        if (tokens[i + k] !== phrase[k]) return false;
    return true;
}

function bestTypo(
    list: WordList,
    key: string,
    wordCount: number
): { edits: number; terms: Term[] } | undefined {
    let best: { edits: number; terms: Term[] } | undefined;
    for (const term of list.terms) {
        if (wordCount > 1 && term.words.length !== wordCount) continue;
        const max = allowedEdits(Math.min(term.key.length, key.length));
        if (max === 0) continue;
        const d = distance(
            key,
            term.key,
            best ? Math.min(max, best.edits) : max
        );
        if (d > max) continue;
        if (!best || d < best.edits) best = { edits: d, terms: [term] };
        else if (d === best.edits) best.terms.push(term);
    }
    return best;
}

/** One word that no window matched: inflection endings, then typos, then compound parts. */
function resolveWord(
    list: WordList,
    w: string,
    depth: number
): { edits: number; meanings: Meaning[] } | undefined {
    const exact = list.exact.get(w);
    if (exact) return { edits: 0, meanings: exact.map((t) => t.meaning) };
    for (const ending of INFLECTIONS) {
        if (w.length - ending.length < 3 || w.slice(-ending.length) !== ending)
            continue;
        const stem = list.exact.get(w.slice(0, -ending.length));
        if (stem) return { edits: 0, meanings: stem.map((t) => t.meaning) };
    }
    const typo = bestTypo(list, w, 1);
    if (typo)
        return {
            edits: typo.edits,
            meanings: typo.terms.map((t) => t.meaning),
        };
    if (depth >= 2 || w.length < 7) return undefined;
    // German compounds: a known head (exact, after a linking letter) and a tail resolved the same way.
    for (let cut = w.length - 3; cut >= 3; cut--) {
        const head = w.slice(0, cut);
        for (const linker of LINKERS) {
            if (linker && head.slice(-linker.length) !== linker) continue;
            const base = head.slice(0, head.length - linker.length);
            if (base.length < 3) continue;
            const headTerms = list.exact.get(base);
            if (!headTerms) continue;
            const tail = resolveWord(list, w.slice(cut), depth + 1);
            if (tail)
                return {
                    edits: tail.edits,
                    meanings: headTerms
                        .map((t) => t.meaning)
                        .concat(tail.meanings),
                };
        }
    }
    return undefined;
}

export function parse(list: WordList, text: string): Parsed {
    const typed = split(text);
    const tokens = typed.map((t) => t.folded);
    const covered: boolean[] = tokens.map(() => false);
    const years: number[] = [];
    let latest = false;
    let allYears = false;

    tokens.forEach((t, i) => {
        if (/^(19|20)\d\d$/.test(t)) {
            years.push(Number(t));
            covered[i] = true;
        }
    });
    for (let i = 0; i < tokens.length; i++) {
        for (const p of ALL_YEARS)
            if (phraseAt(tokens, i, p)) {
                allYears = true;
                for (let k = 0; k < p.length; k++) covered[i + k] = true;
            }
        for (const p of LATEST)
            if (phraseAt(tokens, i, p)) {
                latest = true;
                for (let k = 0; k < p.length; k++) covered[i + k] = true;
            }
    }

    // Windows of up to four words, longest first; exact names beat typos.
    const hits: Hit[] = [];
    for (let i = 0; i < tokens.length; i++) {
        for (
            let len = 1;
            len <= MAX_WINDOW && i + len <= tokens.length;
            len++
        ) {
            let free = true;
            for (let k = i; k < i + len; k++) if (covered[k]) free = false;
            if (!free) break;
            const key = tokens.slice(i, i + len).join("");
            const exact = list.exact.get(key);
            if (exact) {
                hits.push({
                    start: i,
                    length: len,
                    edits: 0,
                    meanings: exact.map((t) => t.meaning),
                });
            } else if (len > 1 && key.length >= 8) {
                const typo = bestTypo(list, key, len);
                if (typo)
                    hits.push({
                        start: i,
                        length: len,
                        edits: typo.edits,
                        meanings: typo.terms.map((t) => t.meaning),
                    });
            }
        }
    }
    hits.sort(
        (a, b) => b.length - a.length || a.edits - b.edits || a.start - b.start
    );
    const meanings: Meaning[] = [];
    for (const h of hits) {
        let free = true;
        for (let k = h.start; k < h.start + h.length; k++)
            if (covered[k]) free = false;
        if (!free) continue;
        for (let k = h.start; k < h.start + h.length; k++) covered[k] = true;
        meanings.push(...h.meanings);
    }

    const unmatched: string[] = [];
    tokens.forEach((t, i) => {
        if (covered[i] || STOP.has(t)) return;
        const r = t.length >= 3 ? resolveWord(list, t, 0) : undefined;
        if (r) meanings.push(...r.meanings);
        else if (t.length >= 3 && !/^\d+$/.test(t))
            unmatched.push(typed[i].typed);
    });

    const filters: Filters = {};
    let explicitAmr = false;
    let explicitPrevalence = false;
    let impliedAmr = false;
    let trend = allYears;
    const pageLinks: PageLinkId[] = [];
    for (const m of meanings) {
        if (m.pageLink && pageLinks.indexOf(m.pageLink) < 0)
            pageLinks.push(m.pageLink);
        const dims = Object.keys(m.sets) as Dim[];
        for (const dim of dims) {
            const into = filters[dim] ?? [];
            for (const v of m.sets[dim] ?? [])
                if (into.indexOf(v) < 0) into.push(v);
            filters[dim] = into;
        }
        if (m.view === "trend") trend = true;
        if (m.page === "amr") {
            if (dims.length === 0) explicitAmr = true;
            else impliedAmr = true;
        }
        if (m.page === "prevalence" && dims.length === 0)
            explicitPrevalence = true;
    }
    // Substances and species exist only on the resistance page.
    if (filters.antimicrobialSubstance || filters.specie) explicitAmr = true;
    let page: Page = "prevalence";
    if (explicitAmr) page = "amr";
    // The trend view is a resistance graph, so a trend word points there too.
    else if (!explicitPrevalence && (impliedAmr || trend)) page = "amr";
    const bothPages =
        !explicitAmr && !impliedAmr && !explicitPrevalence && !trend;

    return {
        filters,
        years,
        latest: latest && years.length === 0,
        trend: trend && years.length === 0,
        page,
        bothPages,
        pageLinks,
        unmatched,
    };
}
