import { createLinkFinder, FoundLink } from "..";
import { snapshotIndex, snapshotOfficialNames } from "../__fixtures__/snapshot";

const finder = createLinkFinder(() => Promise.resolve(snapshotOfficialNames));
const found = async (
    text: string,
    lang: "en" | "de",
    organism?: string
): Promise<FoundLink[]> =>
    (await finder.find(text, lang, snapshotIndex, organism)).links;
const views = async (
    text: string,
    lang: "en" | "de",
    organism?: string
): Promise<string[]> =>
    (await found(text, lang, organism)).map((l) => `${l.page}/${l.view ?? ""}`);

describe("Link Finder trend link alongside the Substance graph", () => {
    it("adds a trend link after the Substance graph link for a resistance search", async () => {
        expect(
            await views("antimicrobial resistance", "en", "Salmonella spp.")
        ).toEqual(["amr/substance", "amr/trend"]);
    });

    it("keeps a single-year search on the Substance graph only", async () => {
        const v = await views("salmonella resistance 2022", "en");
        expect(v.length).toBeGreaterThan(0);
        expect(v).not.toContain("amr/trend");
    });

    it("puts the trend link first when the search has a trend word", async () => {
        const v = await views("salmonella resistance trend", "en");
        expect(v[0]).toBe("amr/trend");
        expect(v).toContain("amr/substance");
    });

    it.each([
        ["Salmonella trend", "en"],
        ["Salmonellen Verlauf", "de"],
    ] as const)("treats %s as a resistance search", async (text, lang) => {
        const v = await views(text, lang);
        expect(v[0]).toBe("amr/trend");
    });

    it("keeps prevalence first for an organism-only search, then fills with resistance links", async () => {
        const v = await views("salmonella", "en");
        expect(v[0]).toBe("prevalence/");
        expect(v.length).toBeLessThanOrEqual(3);
        expect(v).toContain("amr/substance");
        expect(v).toContain("amr/trend");
    });

    it("lists per-organism Substance graph links before trend links", async () => {
        const v = await views("resistance salmonella campylobacter", "en");
        expect(v.length).toBeLessThanOrEqual(3);
        expect(v.indexOf("amr/trend")).toBeGreaterThan(
            v.lastIndexOf("amr/substance")
        );
    });

    it("leaves the trend link out when a value contains a comma", async () => {
        for (const lang of ["de", "en"] as const) {
            const links = await found(
                "Resistenz bei Campylobacter aus Rindern",
                lang
            );
            expect(links.length).toBeGreaterThan(0);
            const bad = links
                .filter((l) => l.view === "trend")
                .flatMap((l) =>
                    Array.from(
                        new URL(l.url, "https://x").searchParams.entries()
                    ).filter(
                        ([k, v]) =>
                            k !== "microorganism" &&
                            k !== "view" &&
                            v.includes(",")
                    )
                );
            expect(bad).toEqual([]);
        }
    });
});
