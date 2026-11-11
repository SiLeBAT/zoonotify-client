import { createLinkFinder } from "..";
import { snapshotIndex, snapshotOfficialNames } from "../__fixtures__/snapshot";
import antibioticDe from "../../../locales/de/Antibiotic.json";
import antibioticEn from "../../../locales/en/Antibiotic.json";
import headerDe from "../../../locales/de/Header.json";
import headerEn from "../../../locales/en/Header.json";
import linkFinderDe from "../../../locales/de/LinkFinder.json";
import linkFinderEn from "../../../locales/en/LinkFinder.json";

const finder = createLinkFinder(() => Promise.resolve(snapshotOfficialNames));

// The names the site itself shows: the navigation (Header) and the AMR graph names.
const LOCALES = {
    en: { header: headerEn, antibiotic: antibioticEn, own: linkFinderEn },
    de: { header: headerDe, antibiotic: antibioticDe, own: linkFinderDe },
} as const;

const PAGE_NAME_KEYS: [string, keyof typeof headerEn, string][] = [
    ["PagePrevalence", "Prevalence", "prevalence"],
    ["PageAntimicrobialUse", "antimicrobial", "antimicrobialUse"],
    ["PageMicrobialCounts", "MicrobialCounts", "microbialCounts"],
    ["PageEvaluations", "Evaluations", "evaluations"],
];

describe("Link Finder page names", () => {
    describe.each(["en", "de"] as const)("%s", (lang) => {
        const { header, antibiotic, own } = LOCALES[lang];
        const ownTitles = own as { [key: string]: string };

        it.each(PAGE_NAME_KEYS)(
            "card title %s is the navigation's name for the page",
            (titleKey, headerKey) => {
                expect(ownTitles[titleKey]).toBe(header[headerKey]);
            }
        );

        it("names each AMR graph as the resistance page does", () => {
            const page = header.AntibioticResistance;
            expect(ownTitles.PageAmrSubstance).toBe(
                `${page}: ${antibiotic.Substans}`
            );
            expect(ownTitles.PageAmrTrend).toBe(`${page}: ${antibiotic.Trend}`);
            expect(ownTitles.PageAmrMulti).toBe(
                `${page}: ${antibiotic.Multi_Breadcrumb}`
            );
        });

        it.each([
            ["antimicrobial", "/antimicrobial"],
            ["MicrobialCounts", "/microbial-counts"],
            ["Evaluations", "/evaluations"],
        ] as const)(
            "the navigation's name %s opens its page as a page word",
            async (headerKey, path) => {
                const result = await finder.find(
                    header[headerKey],
                    lang,
                    snapshotIndex
                );
                expect(result.links.map((l) => l.url)).toEqual([
                    `${path}?lang=${lang}`,
                ]);
            }
        );
    });
});
