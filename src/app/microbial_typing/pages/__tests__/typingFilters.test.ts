import type { TypingResult } from "../typingData";
import {
    emptyTypingSelection,
    filterTypingRows,
    typingFilterOptions,
} from "../typingFilters";

function rel(
    documentId: string,
    name: string
): {
    documentId: string;
    name: string;
} {
    return { documentId, name };
}

function row(
    superOrigin: string,
    origin: string,
    stage: string,
    group: string,
    matrix: string,
    serovar = "S. Infantis"
): TypingResult {
    return {
        samplingYear: 2022,
        numberOfIsolates: 20,
        numberOfIsolatesInSubgroup: 20,
        superCategorySampleOrigin: rel(`so-${superOrigin}`, superOrigin),
        sampleOrigin: rel(`o-${origin}`, origin),
        samplingStage: rel(`st-${stage}`, stage),
        matrixGroup: rel(`mg-${group}`, group),
        matrix: rel(`m-${matrix}`, matrix),
        typingSubgroup: { name: serovar },
    };
}

const BROILER_MEAT = row("Poultry", "Broilers", "Retail", "Meat", "Fresh meat");
const TURKEY_MEAT = row(
    "Poultry",
    "Fattening turkeys",
    "Retail",
    "Meat",
    "Fresh meat"
);
const PIG_FAECES = row("Pigs", "Fattening pigs", "Farm", "Faeces", "Dust");
const ROWS = [BROILER_MEAT, TURKEY_MEAT, PIG_FAECES];

describe("filterTypingRows", () => {
    it("keeps every row when nothing is selected", () => {
        expect(filterTypingRows(ROWS, emptyTypingSelection)).toEqual(ROWS);
    });

    it("keeps rows matching any selected value of a filter", () => {
        const selection = {
            ...emptyTypingSelection,
            sampleOrigin: ["o-Broilers", "o-Fattening pigs"],
        };
        expect(filterTypingRows(ROWS, selection)).toEqual([
            BROILER_MEAT,
            PIG_FAECES,
        ]);
    });

    it("requires a match on every filter that has a selection", () => {
        const selection = {
            ...emptyTypingSelection,
            superCategorySampleOrigin: ["so-Poultry"],
            sampleOrigin: ["o-Fattening turkeys", "o-Fattening pigs"],
        };
        expect(filterTypingRows(ROWS, selection)).toEqual([TURKEY_MEAT]);
    });
});

describe("typingFilterOptions", () => {
    it("offers each value once, sorted by name", () => {
        const options = typingFilterOptions(ROWS, emptyTypingSelection);
        expect(options.sampleOrigin).toEqual([
            { documentId: "o-Broilers", name: "Broilers" },
            { documentId: "o-Fattening pigs", name: "Fattening pigs" },
            { documentId: "o-Fattening turkeys", name: "Fattening turkeys" },
        ]);
        expect(options.matrixGroup).toEqual([
            { documentId: "mg-Faeces", name: "Faeces" },
            { documentId: "mg-Meat", name: "Meat" },
        ]);
    });

    it("narrows a filter's options by the other filters' selections", () => {
        const options = typingFilterOptions(ROWS, {
            ...emptyTypingSelection,
            superCategorySampleOrigin: ["so-Poultry"],
        });
        expect(options.sampleOrigin.map((o) => o.name)).toEqual([
            "Broilers",
            "Fattening turkeys",
        ]);
        expect(options.samplingStage.map((o) => o.name)).toEqual(["Retail"]);
    });

    it("keeps a filter's own alternatives on offer after one is picked", () => {
        const options = typingFilterOptions(ROWS, {
            ...emptyTypingSelection,
            superCategorySampleOrigin: ["so-Poultry"],
        });
        expect(options.superCategorySampleOrigin.map((o) => o.name)).toEqual([
            "Pigs",
            "Poultry",
        ]);
    });
});
