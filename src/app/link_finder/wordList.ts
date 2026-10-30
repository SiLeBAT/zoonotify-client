// The word list: official names (from the CMS) plus everyday words (by hand), as one index.
import {
    AmrView,
    Dim,
    DIMS,
    EnglishSubstanceNames,
    EverydayWord,
    Filters,
    OfficialNames,
    Page,
} from "./model";
import { words } from "./text";

export interface Meaning {
    id: string;
    source: "official" | "everyday";
    sets: Filters;
    page?: Page;
    view?: AmrView;
}

export interface Term {
    words: string[];
    /** Words joined without spaces, so "E coli" and "ecoli" meet. */
    key: string;
    meaning: Meaning;
}

export interface WordList {
    exact: Map<string, Term[]>;
    terms: Term[];
    /** Official German/English names per dimension, for links in either language. */
    names: { [dim: string]: Map<string, string> };
}

// "spp." carries no meaning a visitor types: "Campylobacter" should meet "Campylobacter spp.".
const DROPPED_WORDS = ["spp"];

function addTerm(list: WordList, text: string, meaning: Meaning): void {
    const w = words(text).filter((x) => DROPPED_WORDS.indexOf(x) < 0);
    if (w.length === 0) return;
    const term: Term = { words: w, key: w.join(""), meaning };
    list.terms.push(term);
    const same = list.exact.get(term.key) ?? [];
    same.push(term);
    list.exact.set(term.key, same);
}

export function buildWordList(
    vocabulary: OfficialNames,
    everyday: EverydayWord[],
    englishSubstances: EnglishSubstanceNames
): WordList {
    const list: WordList = { exact: new Map(), terms: [], names: {} };

    for (const dim of DIMS) {
        const pairs = vocabulary.values[dim] ?? [];
        const names = new Map<string, string>();
        for (const p of pairs) {
            names.set(p.en, p.de);
            const meaning: Meaning = {
                id: `${dim}:${p.en}`,
                source: "official",
                sets: { [dim]: [p.en] },
            };
            addTerm(list, p.en, meaning);
            if (p.de !== p.en) addTerm(list, p.de, meaning);
        }
        list.names[dim] = names;
    }

    // Sample types ("Food") are understood but no page URL can carry them, so they set nothing.
    for (const p of vocabulary.values.sampleType ?? []) {
        const meaning: Meaning = {
            id: `sampleType:${p.en}`,
            source: "official",
            sets: {},
        };
        addTerm(list, p.en, meaning);
        addTerm(list, p.de, meaning);
    }

    // Substance names and classes: only for codes that are filter values.
    const codes = new Set(
        (vocabulary.values.antimicrobialSubstance ?? []).map((p) => p.en)
    );
    const classes = new Map<string, string[]>();
    for (const s of vocabulary.substances) {
        if (!codes.has(s.code)) continue;
        const meaning: Meaning = {
            id: `substance:${s.code}`,
            source: "official",
            sets: { antimicrobialSubstance: [s.code] },
        };
        addTerm(list, s.nameDe, meaning);
        const en = englishSubstances[s.code];
        if (en && en !== s.nameDe) addTerm(list, en, meaning);
        if (s.classDe) {
            const members = classes.get(s.classDe) ?? [];
            if (members.indexOf(s.code) < 0) members.push(s.code);
            classes.set(s.classDe, members);
        }
    }
    classes.forEach((members, classDe) => {
        const meaning: Meaning = {
            id: `class:${classDe}`,
            source: "official",
            sets: { antimicrobialSubstance: members },
        };
        addTerm(list, classDe, meaning);
        // "(Fluor)chinolone" is also read without its bracketed part: "Chinolone".
        const bare = classDe.replace(/\([^)]*\)/g, "");
        if (bare !== classDe) addTerm(list, bare, meaning);
    });

    // One official name in two dimensions ("Rind" is a super-category and a sample origin):
    // the broader dimension wins, so a word sets one filter.
    list.exact.forEach((terms, key) => {
        const official = terms.filter(
            (t) =>
                t.meaning.source === "official" &&
                Object.keys(t.meaning.sets).length
        );
        if (official.length < 2) return;
        const rank = (t: Term): number =>
            DIMS.indexOf(Object.keys(t.meaning.sets)[0] as Dim);
        const best = Math.min(...official.map(rank));
        const keep = terms.filter(
            (t) => official.indexOf(t) < 0 || rank(t) === best
        );
        list.exact.set(key, keep);
        list.terms = list.terms.filter(
            (t) => t.key !== key || keep.indexOf(t) >= 0
        );
    });

    for (const row of everyday) {
        const meaning: Meaning = {
            id: row.id,
            source: "everyday",
            sets: row.sets ?? {},
            page: row.page,
            view: row.view,
        };
        for (const text of row.en.concat(row.de)) addTerm(list, text, meaning);
    }
    return list;
}

/** Every everyday word must point at a value that exists, or the list has gone stale. */
export function checkEverydayWords(
    vocabulary: OfficialNames,
    everyday: EverydayWord[]
): string[] {
    const errors: string[] = [];
    const ids = new Set<string>();
    for (const row of everyday) {
        if (ids.has(row.id)) errors.push(`${row.id}: duplicate id`);
        ids.add(row.id);
        if (row.en.length + row.de.length === 0)
            errors.push(`${row.id}: no words`);
        if (!row.sets && !row.page && !row.view)
            errors.push(`${row.id}: sets nothing`);
        const sets = row.sets ?? {};
        for (const dim of Object.keys(sets) as Dim[]) {
            const known = new Set(
                (vocabulary.values[dim] ?? []).map((p) => p.en)
            );
            if (known.size === 0)
                errors.push(`${row.id}: unknown dimension ${dim}`);
            for (const v of sets[dim] ?? [])
                if (!known.has(v))
                    errors.push(
                        `${row.id} (${row.en
                            .concat(row.de)
                            .join(", ")}): ${dim} "${v}" is not a current value`
                    );
        }
    }
    return errors;
}
