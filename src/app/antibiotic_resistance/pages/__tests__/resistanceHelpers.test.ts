import {
    type ResistanceRelationFields,
    buildCombinationKey,
    buildCombinationLabel,
    buildMicroorganismFilter,
    emptyFilterState,
    filterDataExcludingKey,
    meetsMinimumN,
    shouldShowSpeciesFilter,
    uniqueFromItems,
} from "../resistanceHelpers";

const rel = (
    id: number,
    name: string,
    documentId: string
): { id: number; name: string; documentId: string } => ({
    id,
    name,
    documentId,
});

/** One source row of a Combination; relations default to a German-locale E. coli cell. */
const row = (
    overrides: Partial<ResistanceRelationFields> = {}
): ResistanceRelationFields => ({
    samplingYear: 2023,
    specie: null,
    superCategorySampleOrigin: rel(1, "Tier", "sco-tier"),
    sampleOrigin: rel(2, "Masthähnchen", "so-broiler"),
    samplingStage: rel(3, "Schlachthof", "ss-slaughter"),
    matrixGroup: rel(4, "Blinddarminhalt", "mg-caecum"),
    matrix: rel(5, "Blinddarminhalt", "m-caecum"),
    antimicrobialSubstance: rel(6, "Ampicillin", "sub-amp"),
    ...overrides,
});

describe("buildMicroorganismFilter", () => {
    it("matches ESBL/AmpC E. coli by substring so it resolves in both locales", () => {
        // The DB name is translated ("ESBL/AmpC-producing E. coli" vs
        // "ESBL/AmpC-bildende E. coli"), so only the "ESBL" stem is stable.
        expect(buildMicroorganismFilter("ESBL/AmpC E. coli")).toBe(
            "&filters[microorganism][name][$containsi]=ESBL"
        );
    });
});

describe("shouldShowSpeciesFilter", () => {
    it.each(["Campylobacter spp.", "Enterococcus spp."])(
        "offers a species filter for %s",
        (microorganism) => {
            expect(shouldShowSpeciesFilter(microorganism)).toBe(true);
        }
    );

    it.each(["E. coli", "Salmonella spp.", "MRSA"])(
        "offers no species filter for %s",
        (microorganism) => {
            expect(shouldShowSpeciesFilter(microorganism)).toBe(false);
        }
    );
});

describe("meetsMinimumN", () => {
    it("plots a Combination with at least 10 tested isolates", () => {
        expect(meetsMinimumN(10)).toBe(true);
        expect(meetsMinimumN(170)).toBe(true);
    });

    it("does not plot a Combination with fewer than 10 tested isolates", () => {
        expect(meetsMinimumN(9)).toBe(false);
        expect(meetsMinimumN(0)).toBe(false);
    });
});

describe("buildCombinationKey", () => {
    it("is the same in both locales, so a selection survives a language switch", () => {
        const german = row();
        const english = row({
            sampleOrigin: rel(12, "Broilers", "so-broiler"),
            samplingStage: rel(13, "Slaughterhouse", "ss-slaughter"),
            matrix: rel(15, "Caecal content", "m-caecum"),
        });

        expect(buildCombinationKey(english, "E. coli")).toBe(
            buildCombinationKey(german, "E. coli")
        );
    });

    it("separates cells that differ in any sample relation", () => {
        const other = row({
            samplingStage: rel(7, "Einzelhandel", "ss-retail"),
        });

        expect(buildCombinationKey(other, "E. coli")).not.toBe(
            buildCombinationKey(row(), "E. coli")
        );
    });

    it("ignores the substance, which is not part of a Combination", () => {
        const other = row({
            antimicrobialSubstance: rel(8, "Colistin", "sub-col"),
        });

        expect(buildCombinationKey(other, "E. coli")).toBe(
            buildCombinationKey(row(), "E. coli")
        );
    });

    it("splits by species for Campylobacter", () => {
        const jejuni = row({ specie: rel(9, "C. jejuni", "sp-jejuni") });
        const coli = row({ specie: rel(10, "C. coli", "sp-coli") });

        expect(buildCombinationKey(jejuni, "Campylobacter spp.")).not.toBe(
            buildCombinationKey(coli, "Campylobacter spp.")
        );
    });

    it("does not split by species for other microorganisms", () => {
        const withSpecie = row({ specie: rel(9, "C. jejuni", "sp-jejuni") });

        expect(buildCombinationKey(withSpecie, "E. coli")).toBe(
            buildCombinationKey(row(), "E. coli")
        );
    });

    it("keeps the documentId|… format stored in existing share links", () => {
        expect(buildCombinationKey(row({ matrixGroup: null }), "E. coli")).toBe(
            "sco-tier|so-broiler|ss-slaughter|-|m-caecum"
        );
    });
});

describe("buildCombinationLabel", () => {
    it("names matrix, sample origin and sampling stage in the row's locale", () => {
        expect(buildCombinationLabel(row(), "E. coli")).toBe(
            "Blinddarminhalt | Masthähnchen | Schlachthof"
        );
    });

    it("leads with the species for Enterococcus", () => {
        const faecium = row({ specie: rel(9, "E. faecium", "sp-faecium") });

        expect(buildCombinationLabel(faecium, "Enterococcus spp.")).toBe(
            "E. faecium | Blinddarminhalt | Masthähnchen | Schlachthof"
        );
    });

    it("leaves a missing relation blank", () => {
        expect(
            buildCombinationLabel(row({ samplingStage: null }), "E. coli")
        ).toBe("Blinddarminhalt | Masthähnchen | ");
    });
});

describe("uniqueFromItems", () => {
    it("offers each sampling year once, oldest first", () => {
        const rows = [2023, 2021, 2023, 2022].map((samplingYear) =>
            row({ samplingYear })
        );

        expect(uniqueFromItems(rows, "samplingYear")).toEqual([
            { id: "2021", name: "2021", documentId: "2021" },
            { id: "2022", name: "2022", documentId: "2022" },
            { id: "2023", name: "2023", documentId: "2023" },
        ]);
    });

    it("offers each relation once per documentId, skipping rows without it", () => {
        const rows = [
            row(),
            row({ antimicrobialSubstance: rel(6, "Ampicillin", "sub-amp") }),
            row({ antimicrobialSubstance: rel(8, "Colistin", "sub-col") }),
            row({ antimicrobialSubstance: null }),
        ];

        expect(uniqueFromItems(rows, "antimicrobialSubstance")).toEqual([
            { id: "6", name: "Ampicillin", documentId: "sub-amp" },
            { id: "8", name: "Colistin", documentId: "sub-col" },
        ]);
    });
});

describe("filterDataExcludingKey", () => {
    const broilerSlaughter = row();
    const broilerRetail = row({
        samplingStage: rel(7, "Einzelhandel", "ss-retail"),
    });
    const turkeySlaughter = row({ sampleOrigin: rel(11, "Pute", "so-turkey") });
    const colistin = row({
        antimicrobialSubstance: rel(8, "Colistin", "sub-col"),
    });
    const lastYear = row({ samplingYear: 2022 });
    const rows = [
        broilerSlaughter,
        broilerRetail,
        turkeySlaughter,
        colistin,
        lastYear,
    ];

    it("keeps every row when nothing is selected", () => {
        expect(
            filterDataExcludingKey(rows, emptyFilterState, [], "matrix")
        ).toEqual(rows);
    });

    it("applies every selection together", () => {
        const selected = {
            ...emptyFilterState,
            samplingYear: ["2023"],
            samplingStage: ["ss-slaughter"],
            sampleOrigin: ["so-broiler"],
        };

        expect(
            filterDataExcludingKey(rows, selected, ["sub-amp"], "matrix")
        ).toEqual([broilerSlaughter]);
    });

    it("ignores the selection of the key whose options are being built", () => {
        const selected = {
            ...emptyFilterState,
            samplingStage: ["ss-slaughter"],
        };

        expect(
            filterDataExcludingKey(rows, selected, ["sub-amp"], "samplingStage")
        ).toContain(broilerRetail);
    });

    it("filters substances by the separate substance selection", () => {
        expect(
            filterDataExcludingKey(
                rows,
                emptyFilterState,
                ["sub-col"],
                "matrix"
            )
        ).toEqual([colistin]);
        expect(
            filterDataExcludingKey(
                rows,
                emptyFilterState,
                ["sub-col"],
                "antimicrobialSubstance"
            )
        ).toEqual(rows);
    });
});
