// Spelling rules (code, not word list), applied the same way to the word list and to the search text.

const UMLAUTS: { [c: string]: string } = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };

/** Lower case, ä→ae ö→oe ü→ue ß→ss, other accents dropped: "Hähnchen" and "Haehnchen" fold alike. */
export function fold(text: string): string {
    return text
        .toLowerCase()
        .replace(/[äöüß]/g, (c) => UMLAUTS[c])
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "");
}

export interface Token {
    /** As the matcher reads it: folded. */
    folded: string;
    /** As the visitor typed it, for naming unmatched words. */
    typed: string;
}

/** Words of a text. Brackets are dropped so "(Fluor)chinolone" reads as "fluorchinolone". */
export function tokens(text: string): Token[] {
    const out: Token[] = [];
    let folded = "";
    let typed = "";
    const end = (): void => {
        if (folded) out.push({ folded, typed });
        folded = "";
        typed = "";
    };
    for (const c of text.replace(/[()´']/g, "")) {
        const f = fold(c);
        if (f === "" || /^[a-z0-9]+$/.test(f)) {
            folded += f;
            typed += c;
        } else end();
    }
    end();
    return out;
}

/** Folded words of a text. */
export function words(text: string): string[] {
    return tokens(text).map((t) => t.folded);
}

/** Edits a word of this length may be off by and still match: none below 5 letters. */
export function allowedEdits(length: number): number {
    if (length >= 9) return 2;
    if (length >= 5) return 1;
    return 0;
}

/** Levenshtein distance, stopping early once it exceeds `max`. */
export function distance(a: string, b: string, max: number): number {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev: number[] = [];
    for (let j = 0; j <= b.length; j++) prev.push(j);
    for (let i = 1; i <= a.length; i++) {
        const row = [i];
        let best = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
            const v = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
            row.push(v);
            if (v < best) best = v;
        }
        if (best > max) return max + 1;
        prev = row;
    }
    return prev[b.length];
}

/** German inflection endings tried when a word has no hit as typed ("resistenter" → "resistent"). */
export const INFLECTIONS = ["en", "er", "es", "em", "e", "n", "s"];

/** Linking letters between the parts of a German compound ("Pute-n-fleisch", "Rind-er-hackfleisch"). */
export const LINKERS = ["", "n", "en", "er", "s", "e", "es"];
