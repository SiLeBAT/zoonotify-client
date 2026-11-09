import { APIRequestContext } from "@playwright/test";
import { hasItalicWord } from "./canvas-spy";
import { Locale, normalise } from "./oracle";
import { loadPrevalenceItems } from "./prevalence-api";

/** The graph compares at most this many combinations (MAX_COMBINATIONS). */
export const MAX_COMBINATIONS = 4;

export interface PrevalenceRow {
    year: number;
    microorganism: string;
    microorganismId: string;
    sampleOrigin: string;
    sampleOriginId: string;
    /** `sampleOrigin-matrix-samplingStage`, the legend label. */
    combination: string;
}

/** All prevalence rows in a locale, as the client fetches them. */
export async function prevalenceRows(
    request: APIRequestContext,
    locale: Locale
): Promise<PrevalenceRow[]> {
    const data = await loadPrevalenceItems(request, locale, [
        "matrix",
        "microorganism",
        "samplingStage",
        "sampleOrigin",
    ]);
    return data.map((r) => {
        const origin = r.sampleOrigin?.name ?? "";
        return {
            year: r.samplingYear ?? 0,
            microorganism: normalise(r.microorganism?.name ?? ""),
            microorganismId: r.microorganism?.documentId ?? "",
            sampleOrigin: normalise(origin),
            sampleOriginId: r.sampleOrigin?.documentId ?? "",
            combination: normalise(
                `${origin}-${r.matrix?.name ?? ""}-${
                    r.samplingStage?.name ?? ""
                }`
            ),
        };
    });
}

export interface Scenario {
    originId: string;
    /** The sample origin and every microorganism it has data for, per locale. */
    origin: Record<Locale, string>;
    microorganisms: Record<Locale, string[]>;
    microorganismIds: string[];
    /** Microorganism the figure checks plot (by id). */
    figureMicroId: string;
}

const rowsOf = (rows: PrevalenceRow[], originId: string): PrevalenceRow[] =>
    rows.filter((r) => r.sampleOriginId === originId);

/** Combinations of one microorganism within one sample origin. */
export function combinationsOf(
    rows: PrevalenceRow[],
    originId: string,
    microId: string
): string[] {
    return Array.from(
        new Set(
            rowsOf(rows, originId)
                .filter((r) => r.microorganismId === microId)
                .map((r) => r.combination)
        )
    );
}

/** Years one microorganism has data for within one sample origin. */
export function yearsOf(
    rows: PrevalenceRow[],
    originId: string,
    microId: string,
    combinations?: string[]
): number[] {
    return Array.from(
        new Set(
            rowsOf(rows, originId)
                .filter(
                    (r) =>
                        r.microorganismId === microId &&
                        (!combinations || combinations.includes(r.combination))
                )
                .map((r) => r.year)
        )
    ).sort((a, b) => a - b);
}

/**
 * Picks live data to plot: the sample origin with the most microorganisms
 * (ties by name), so a microorganism switch has something to switch to. For
 * the figure, prefer a microorganism with an italic word and at most
 * MAX_COMBINATIONS combinations, which makes the legend exact. Returns null
 * when no origin has two microorganisms.
 */
export function pickScenario(
    en: PrevalenceRow[],
    de: PrevalenceRow[]
): Scenario | null {
    const microsByOrigin = new Map<string, Set<string>>();
    for (const r of en) {
        if (!r.sampleOriginId || !r.microorganismId) continue;
        const set = microsByOrigin.get(r.sampleOriginId) ?? new Set();
        set.add(r.microorganismId);
        microsByOrigin.set(r.sampleOriginId, set);
    }
    const nameOf = (id: string): string =>
        en.find((r) => r.sampleOriginId === id)?.sampleOrigin ?? "";
    const ranked = Array.from(microsByOrigin.entries())
        .filter(([, micros]) => micros.size >= 2)
        .sort(
            (a, b) =>
                b[1].size - a[1].size ||
                nameOf(a[0]).localeCompare(nameOf(b[0]))
        );
    if (ranked.length === 0) return null;

    const [originId, microSet] = ranked[0];
    const name = (rows: PrevalenceRow[], micro: string): string =>
        rows.find((r) => r.microorganismId === micro)?.microorganism ?? "";
    const microorganismIds = Array.from(microSet).sort((a, b) =>
        name(en, a).localeCompare(name(en, b))
    );
    const fits = (id: string): boolean => {
        const n = combinationsOf(en, originId, id).length;
        return n >= 1 && n <= MAX_COMBINATIONS;
    };
    const figureMicroId =
        microorganismIds.find(
            (id) => hasItalicWord(name(en, id)) && fits(id)
        ) ??
        microorganismIds.find((id) => hasItalicWord(name(en, id))) ??
        microorganismIds[0];

    return {
        originId,
        origin: {
            en: nameOf(originId),
            de:
                de.find((r) => r.sampleOriginId === originId)?.sampleOrigin ??
                "",
        },
        microorganisms: {
            en: microorganismIds.map((id) => name(en, id)),
            de: microorganismIds.map((id) => name(de, id)),
        },
        microorganismIds,
        figureMicroId,
    };
}

/**
 * Checks a drawn legend against the combinations the API holds: exactly the
 * plotted ones when the cap does not bite, else a full set of valid ones.
 */
export function legendProblems(drawn: string[], available: string[]): string[] {
    const shown = drawn.map(normalise);
    const problems: string[] = [];
    const unknown = shown.filter((s) => !available.includes(s));
    if (unknown.length > 0) {
        problems.push(`legend entries not in the API: ${unknown.join(" | ")}`);
    }
    const want = Math.min(MAX_COMBINATIONS, available.length);
    if (shown.length !== want) {
        problems.push(`legend has ${shown.length} entries, expected ${want}`);
    }
    if (available.length <= MAX_COMBINATIONS) {
        const missing = available.filter((a) => !shown.includes(a));
        if (missing.length > 0) {
            problems.push(`legend lacks: ${missing.join(" | ")}`);
        }
    }
    return problems;
}
