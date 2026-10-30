// Pinned expected links for the frozen question sets (issue 070, with the 2026-10-29
// rewordings), against snapshot 2026-10-29T15:05:50Z. Written before any word-list entry
// existed; ported unchanged from the Link Finder spike.
import { AmrView, Dim, Lang, LinkSpec, Page } from "../model";

export type ValueRule = string[] | { subsetOf: string[] };

/** One exact link that counts as right. Dimensions not listed must not be set. */
export interface Alternative {
    page: Page;
    views?: AmrView[];
    years?: number[];
    filters: { [D in Dim]?: ValueRule };
}

export interface Pin {
    id: string;
    lang: Lang;
    situation: string;
    question: string;
    accept: Alternative[];
    /** Not-in-data floor: no top-three link sets any `forbid` dimension, and this word is reported unmatched. */
    notInData?: { unmatchedWord: string; forbid: Dim[] };
}

const CAMPY = "Campylobacter spp.";
const SALM = "Salmonella spp.";
const MRSA = "Methicillin-resistant Staphylococcus aureus (MRSA)";
const STEC = "Shigatoxin-producing E. coli (STEC)";
const LMONO = "Listeria monocytogenes";
const MEAT = "Fresh meat";
const MEAT_GROUP = "Meat and meat products";
const CALVES = [
    "Fattening calves (under or up to 1 year)",
    "Fattening calves (for slaughter at 12 months of age at the latest)",
    "Fattening calves (raised on beef cattle farms)",
    "Fattening calvesg (raised on dairy farms)",
];
const TREND: AmrView[] = ["trend", "substance"];

type F = Alternative["filters"];

/** "X meat": matrix Fresh meat, or matrix group Meat and meat products (equivalent, user 2026-10-29). */
function meat(
    page: Page,
    filters: F,
    years?: number[],
    views?: AmrView[]
): Alternative[] {
    return [
        { page, views, years, filters: { ...filters, matrix: [MEAT] } },
        {
            page,
            views,
            years,
            filters: { ...filters, matrixGroup: [MEAT_GROUP] },
        },
    ];
}

const P: {
    [id: string]: {
        situation: string;
        en: string;
        de: string;
        accept: Alternative[];
        notInData?: Pin["notInData"];
    };
} = {
    "1": {
        situation: "Lookup",
        en: "What share of Campylobacter coli from chicken was resistant to ciprofloxacin in 2024?",
        de: "Wie hoch war 2024 der Anteil ciprofloxacinresistenter Campylobacter coli aus Hähnchen?",
        accept: [
            {
                page: "amr",
                years: [2024],
                filters: {
                    microorganism: [CAMPY],
                    specie: ["C. coli"],
                    superCategorySampleOrigin: ["Chicken"],
                    antimicrobialSubstance: ["CIP"],
                },
            },
        ],
    },
    "2": {
        situation: "Lookup",
        en: "How many MRSA isolates from turkey meat were tested against tetracycline in the latest year, and how many were resistant?",
        de: "Wie viele MRSA-Isolate aus Putenfleisch wurden im letzten Jahr auf Tetracyclin getestet, und wie viele waren resistent?",
        accept: meat(
            "amr",
            {
                microorganism: [MRSA],
                superCategorySampleOrigin: ["Turkey"],
                antimicrobialSubstance: ["TET"],
            },
            [2024]
        ),
    },
    "3": {
        situation: "Lookup",
        en: "What was the prevalence of Listeria monocytogenes in the most recent year it was sampled?",
        de: "Wie hoch war die Prävalenz von Listeria monocytogenes im letzten Jahr, in dem untersucht wurde?",
        accept: [
            {
                page: "prevalence",
                years: [2024],
                filters: { microorganism: [LMONO] },
            },
        ],
    },
    "4": {
        situation: "Trend",
        en: "How has ciprofloxacin resistance in Campylobacter jejuni from broilers changed over the years?",
        de: "Wie hat sich die Ciprofloxacin-Resistenz bei Campylobacter jejuni aus Masthähnchen über die Jahre entwickelt?",
        accept: [
            {
                page: "amr",
                views: TREND,
                filters: {
                    microorganism: [CAMPY],
                    specie: ["C. jejuni"],
                    sampleOrigin: ["Broilers"],
                    antimicrobialSubstance: ["CIP"],
                },
            },
        ],
    },
    "5": {
        situation: "Trend",
        en: "Show Salmonella prevalence in chicken meat for every year available.",
        de: "Zeig mir die Salmonellen-Prävalenz in Hähnchenfleisch für alle verfügbaren Jahre.",
        accept: meat("prevalence", {
            microorganism: [SALM],
            superCategorySampleOrigin: ["Chicken"],
        }),
    },
    "6": {
        situation: "Underspecified",
        en: "How resistant is E. coli in poultry?",
        de: "Wie resistent ist E. coli bei Geflügel?",
        accept: [
            {
                page: "amr",
                filters: {
                    microorganism: ["E. coli"],
                    superCategorySampleOrigin: {
                        subsetOf: ["Chicken", "Turkey", "Duck"],
                    },
                },
            },
        ],
    },
    "7": {
        situation: "Underspecified",
        en: "How common is Salmonella in food?",
        de: "Wie häufig kommen Salmonellen in Lebensmitteln vor?",
        // "food" (sample type) is not a prevalence URL parameter, so only the organism can be set.
        accept: [{ page: "prevalence", filters: { microorganism: [SALM] } }],
    },
    "8": {
        situation: "Term / typo",
        en: "cipro resistance campylobacter chiken 2024",
        de: "cipro resistenz campylobacter hänchen 2024",
        accept: [
            {
                page: "amr",
                years: [2024],
                filters: {
                    microorganism: [CAMPY],
                    superCategorySampleOrigin: ["Chicken"],
                    antimicrobialSubstance: ["CIP"],
                },
            },
        ],
    },
    "9": {
        situation: "Term / typo",
        en: "Which data do you have on fluoroquinolone resistance in STEC?",
        de: "Welche Daten gibt es zur Fluorchinolon-Resistenz bei STEC?",
        accept: [
            {
                page: "amr",
                filters: {
                    microorganism: [STEC],
                    antimicrobialSubstance: ["CIP", "NAL"],
                },
            },
        ],
    },
    "10": {
        situation: "Aggregation trap",
        en: "What is the average ciprofloxacin resistance of Campylobacter across all years?",
        de: "Wie hoch ist die durchschnittliche Ciprofloxacin-Resistenz von Campylobacter über alle Jahre?",
        accept: [undefined, ["C. jejuni"], ["C. coli"]].map((specie) => ({
            page: "amr" as Page,
            views: TREND,
            filters: specie
                ? {
                      microorganism: [CAMPY],
                      specie,
                      antimicrobialSubstance: ["CIP"],
                  }
                : { microorganism: [CAMPY], antimicrobialSubstance: ["CIP"] },
        })),
    },
    "11": {
        situation: "Aggregation trap",
        en: "Combine C. coli and C. jejuni into one overall figure for chicken in 2024.",
        de: "Fass C. coli und C. jejuni für Hähnchen 2024 zu einer Gesamtzahl zusammen.",
        accept: [["C. coli"], ["C. jejuni"], ["C. coli", "C. jejuni"]].map(
            (specie) => ({
                page: "amr" as Page,
                years: [2024],
                filters: {
                    microorganism: [CAMPY],
                    specie,
                    superCategorySampleOrigin: ["Chicken"],
                },
            })
        ),
    },
    "12": {
        situation: "Not in data",
        en: "How resistant is E. coli to temocillin?",
        de: "Wie resistent ist E. coli gegen Temocillin?",
        accept: [],
        notInData: {
            unmatchedWord: "temocillin",
            forbid: ["antimicrobialSubstance"],
        },
    },
};

const GERMAN_ONLY: {
    [id: string]: { situation: string; de: string; accept: Alternative[] };
} = {
    G13: {
        situation: "Compound",
        de: "Salmonellen in Kalbfleisch",
        accept: ([] as Alternative[]).concat(
            meat("prevalence", {
                microorganism: [SALM],
                sampleOrigin: { subsetOf: CALVES },
            }),
            meat("prevalence", {
                microorganism: [SALM],
                superCategorySampleOrigin: ["Cattle, bovine animals"],
                sampleOrigin: { subsetOf: CALVES },
            })
        ),
    },
    G14: {
        situation: "Compound",
        de: "Campylobacter in Putenfleisch 2024",
        accept: meat(
            "prevalence",
            { microorganism: [CAMPY], superCategorySampleOrigin: ["Turkey"] },
            [2024]
        ),
    },
    G15: {
        situation: "Compound",
        de: "STEC in Rinderhackfleisch",
        accept: [
            {
                page: "prevalence",
                filters: {
                    microorganism: [STEC],
                    superCategorySampleOrigin: ["Cattle, bovine animals"],
                    matrix: ["Minced meat"],
                },
            },
            {
                page: "prevalence",
                filters: {
                    microorganism: [STEC],
                    sampleOrigin: ["Cattle"],
                    matrix: ["Minced meat"],
                },
            },
        ],
    },
    G16: {
        situation: "ae/oe/ue spelling",
        de: "Haehnchen Campylobacter Resistenz",
        accept: [
            {
                page: "amr",
                filters: {
                    microorganism: [CAMPY],
                    superCategorySampleOrigin: ["Chicken"],
                },
            },
        ],
    },
    G17: {
        situation: "Typo",
        de: "Salmonelen in Schweinefleish",
        accept: meat("prevalence", {
            microorganism: [SALM],
            superCategorySampleOrigin: ["Pig"],
        }),
    },
    G18: {
        situation: "Class name",
        de: "Resistenz gegen Cephalosporine der dritten Generation bei E. coli aus Schweinen",
        accept: [
            {
                page: "amr",
                filters: {
                    microorganism: ["E. coli"],
                    superCategorySampleOrigin: ["Pig"],
                    antimicrobialSubstance: ["FOT", "TAZ"],
                },
            },
        ],
    },
};

export const FROZEN: Pin[] = [];
for (const id of Object.keys(P)) {
    const p = P[id];
    FROZEN.push({
        id,
        lang: "en",
        situation: p.situation,
        question: p.en,
        accept: p.accept,
        notInData: p.notInData,
    });
}
for (const id of Object.keys(P)) {
    const p = P[id];
    FROZEN.push({
        id: `G${id}`,
        lang: "de",
        situation: p.situation,
        question: p.de,
        accept: p.accept,
        notInData: p.notInData,
    });
}
for (const id of Object.keys(GERMAN_ONLY)) {
    const p = GERMAN_ONLY[id];
    FROZEN.push({
        id,
        lang: "de",
        situation: p.situation,
        question: p.de,
        accept: p.accept,
    });
}

function sameSet(
    a: (string | number)[] = [],
    b: (string | number)[] = []
): boolean {
    return a.length === b.length && a.every((x) => b.indexOf(x) >= 0);
}

/** Whether a link is one of a pin's accepted exact links (the spike scorer's rule). */
export function fits(link: LinkSpec, alt: Alternative): boolean {
    if (link.page !== alt.page) return false;
    if (
        link.page === "amr" &&
        (alt.views ?? ["substance"]).indexOf(link.view ?? "substance") < 0
    )
        return false;
    if (!sameSet(link.years ?? [], alt.years ?? [])) return false;
    const dims = Object.keys(link.filters) as Dim[];
    if (!sameSet(dims, Object.keys(alt.filters))) return false;
    return dims.every((d) => {
        const rule = alt.filters[d];
        const got = link.filters[d] ?? [];
        if (!rule) return false;
        if (Array.isArray(rule)) return sameSet(got, rule);
        return (
            got.length > 0 && got.every((v) => rule.subsetOf.indexOf(v) >= 0)
        );
    });
}
