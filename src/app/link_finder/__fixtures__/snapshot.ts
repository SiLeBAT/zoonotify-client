// Test-only: the frozen CMS snapshot (captured 2026-10-29 from zoonotify.bfr.berlin) as a
// snapshot-backed data index, and as a fake `fetch` that answers the CMS public API.
import { AMR_ORGANISMS_WITHOUT_DATA } from "../../antibiotic_resistance/pages/amrOrganisms";
import { MINIMUM_N } from "../../antibiotic_resistance/pages/resistanceHelpers";
import { DataIndex, Dim, LinkSpec, OfficialNames } from "../model";
import vocabularyJson from "./snapshot-vocabulary.json";
import factsJson from "./snapshot-facts.json";

type Row = { [key: string]: string | number | null };

interface PackedFacts {
    strings: string[];
    resistanceColumns: string[];
    prevalenceColumns: string[];
    resistances: number[][];
    prevalences: number[][];
}

const NUMERIC = ["samplingYear", "tested"];

function unpack(columns: string[], rows: number[][], strings: string[]): Row[] {
    return rows.map((cells) => {
        const row: Row = {};
        columns.forEach((c, i) => {
            const v = cells[i];
            row[c] = NUMERIC.indexOf(c) >= 0 ? v : v < 0 ? null : strings[v];
        });
        return row;
    });
}

const packed = factsJson as unknown as PackedFacts;
const resistances = unpack(
    packed.resistanceColumns,
    packed.resistances,
    packed.strings
);
const prevalences = unpack(
    packed.prevalenceColumns,
    packed.prevalences,
    packed.strings
);

export const snapshotOfficialNames = vocabularyJson as unknown as OfficialNames;

/** Newest year among the snapshot's rows that fit a link, counting AMR rows of at least `minimumTested` isolates. */
function newestYearInRows(
    link: LinkSpec,
    minimumTested: number
): number | undefined {
    const amr = link.page === "amr";
    const rows = amr ? resistances : prevalences;
    const dims = Object.keys(link.filters) as Dim[];
    let newest: number | undefined;
    for (const r of rows) {
        if (amr && Number(r.tested) < minimumTested) continue;
        if (link.years && link.years.indexOf(Number(r.samplingYear)) < 0)
            continue;
        const fits = dims.every((dim) => {
            const want = link.filters[dim] ?? [];
            return !want.length || want.indexOf(String(r[dim])) >= 0;
        });
        if (fits && (newest === undefined || Number(r.samplingYear) > newest))
            newest = Number(r.samplingYear);
    }
    return newest;
}

/** Newest year the snapshot holds for a link, or undefined when the link would draw nothing. */
export function newestYearInSnapshot(link: LinkSpec): number | undefined {
    const organisms = link.filters.microorganism ?? [];
    if (
        link.page === "amr" &&
        organisms.some((o) => AMR_ORGANISMS_WITHOUT_DATA.has(o))
    )
        return undefined;
    return newestYearInRows(link, MINIMUM_N);
}

/** The snapshot-backed data index. */
export const snapshotIndex: DataIndex = {
    newestYear: (link) => Promise.resolve(newestYearInSnapshot(link)),
};

// ---- A fake CMS public API over the snapshot ----

const COLLECTION_OF: { [collection: string]: string } = {
    microorganisms: "microorganism",
    species: "specie",
    "sample-types": "sampleType",
    "super-category-sample-origins": "superCategorySampleOrigin",
    "sample-origins": "sampleOrigin",
    "sampling-stages": "samplingStage",
    "matrix-groups": "matrixGroup",
    matrices: "matrix",
    "antimicrobial-substances": "antimicrobialSubstance",
};

function json(body: unknown): Response {
    return {
        ok: true,
        status: 200,
        json: () => Promise.resolve(body),
    } as unknown as Response;
}

function page<T>(data: T[], params: URLSearchParams): unknown {
    const size = Number(params.get("pagination[pageSize]") ?? 25);
    const n = Number(params.get("pagination[page]") ?? 1);
    return {
        data: data.slice((n - 1) * size, n * size),
        meta: {
            pagination: {
                page: n,
                pageSize: size,
                pageCount: Math.max(1, Math.ceil(data.length / size)),
                total: data.length,
            },
        },
    };
}

/** Reads the `filters[...]` of a data-check request back into a link, as the CMS would. */
function linkFromQuery(
    page_: "prevalence" | "amr",
    q: URLSearchParams
): LinkSpec {
    const link: LinkSpec = { page: page_, filters: {} };
    q.forEach((value, key) => {
        const year = /^filters\[samplingYear\]\[\$in\]\[\d+\]$/.exec(key);
        if (year) link.years = (link.years ?? []).concat(Number(value));
        const dim = /^filters\[(\w+)\]\[name\]\[\$in\]\[\d+\]$/.exec(key);
        if (dim) {
            const d = dim[1] as Dim;
            link.filters[d] = (link.filters[d] ?? []).concat(value);
        }
    });
    return link;
}

/** Rows as the CMS returns them: it knows nothing of "Coming soon", only the filters it is sent. */
function rowsFor(link: LinkSpec, q: URLSearchParams): Row[] {
    const minimum = Number(
        q.get("filters[anzahlGetesteterIsolate][$gte]") ?? 0
    );
    const newest = newestYearInRows(link, minimum);
    return newest === undefined ? [] : [{ samplingYear: newest }];
}

export interface FakeCms {
    fetch: typeof fetch;
    /** Every URL requested, in order. */
    requests: string[];
}

/** A `fetch` that serves the snapshot as the CMS public API serves it, and records each URL. */
export function fakeCms(apiBase: string): FakeCms {
    const requests: string[] = [];
    const fake = (input: RequestInfo | URL): Promise<Response> => {
        const url = new URL(String(input));
        requests.push(url.toString());
        const collection = url.pathname.slice(
            new URL(apiBase).pathname.length + 1
        );
        const q = url.searchParams;
        const dim = COLLECTION_OF[collection];
        if (dim) {
            const pairs = snapshotOfficialNames.values[dim] ?? [];
            const locale = q.get("locale") === "de" ? "de" : "en";
            const rows = pairs.map((p, i) => ({
                documentId: `${dim}-${i}`,
                name: p[locale],
            }));
            return Promise.resolve(json(page(rows, q)));
        }
        if (collection === "antibiotics")
            return Promise.resolve(
                json(
                    page(
                        snapshotOfficialNames.substances.map((s) => ({
                            shortName: s.code,
                            name: s.nameDe,
                        })),
                        q
                    )
                )
            );
        if (collection === "resistance-tables")
            return Promise.resolve(
                json(
                    page(
                        [
                            {
                                cut_offs: snapshotOfficialNames.substances.map(
                                    (s) => ({
                                        substanzklasse: s.classDe,
                                        antibiotic: { shortName: s.code },
                                    })
                                ),
                            },
                        ],
                        q
                    )
                )
            );
        if (collection === "prevalences" || collection === "resistances") {
            const link = linkFromQuery(
                collection === "prevalences" ? "prevalence" : "amr",
                q
            );
            return Promise.resolve(json(page(rowsFor(link, q), q)));
        }
        return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({}),
        } as unknown as Response);
    };
    return { fetch: fake as typeof fetch, requests };
}
