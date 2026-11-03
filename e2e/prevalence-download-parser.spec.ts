import { expect, test } from "@playwright/test";
import {
    CSV_COLUMNS,
    ExpectedRow,
    csvFormatProblems,
    parseCsv,
    readmeProblems,
    rowProblems,
    zipEntryProblems,
} from "./release/support/prevalence-download";

/**
 * The prevalence download checker's own rules, run against hand-made CSV
 * fixtures in the ordinary CMS-free sweep. An altered fixture must fail.
 */

const HEADERS = CSV_COLUMNS.map((c) => `Header ${c.key}`);

const ROW_A: ExpectedRow = {
    samplingYear: 2020,
    microorganism: "Salmonella spp.",
    sampleOrigin: "Cattle",
    superCategorySampleOrigin: "Animals",
    samplingStage: "Farm",
    matrix: "Faeces",
    matrixGroup: "Excreta",
    numberOfSamples: 100,
    numberOfPositive: 7,
    percentageOfPositive: 7.5,
    ciMin: 3.25,
    ciMax: 12,
};
const ROW_B: ExpectedRow = {
    ...ROW_A,
    samplingYear: 2021,
    matrix: 'Say "cheese"',
    percentageOfPositive: 0.1,
};

function line(row: ExpectedRow, decimal: string): string {
    return CSV_COLUMNS.map((c) => {
        const v = row[c.key];
        return typeof v === "number"
            ? String(v).replace(".", decimal)
            : `"${String(v).replace(/"/g, '""')}"`;
    }).join(";");
}

function csv(rows: ExpectedRow[], decimal: string): string {
    return ["﻿" + HEADERS.join(";"), ...rows.map((r) => line(r, decimal))].join(
        "\n"
    );
}

const OPTS = (decimal: string) => ({ decimal, headers: HEADERS });

test.describe("parseCsv", () => {
    test("reads quoted cells with doubled quotes and flags the BOM", () => {
        const parsed = parseCsv(csv([ROW_B], "."));
        expect(parsed.bom).toBe(true);
        expect(parsed.rows[0][0]).toEqual({ value: HEADERS[0], quoted: false });
        const matrix = parsed.rows[1][5];
        expect(matrix).toEqual({ value: 'Say "cheese"', quoted: true });
    });

    test("keeps a semicolon or newline inside quotes in one cell", () => {
        const parsed = parseCsv('a;"b;\nc";d');
        expect(parsed.rows).toEqual([
            [
                { value: "a", quoted: false },
                { value: "b;\nc", quoted: true },
                { value: "d", quoted: false },
            ],
        ]);
    });
});

test.describe("csvFormatProblems", () => {
    test("accepts the client's format for both decimal separators", () => {
        expect(csvFormatProblems(csv([ROW_A, ROW_B], "."), OPTS("."))).toEqual(
            []
        );
        expect(csvFormatProblems(csv([ROW_A, ROW_B], ","), OPTS(","))).toEqual(
            []
        );
    });

    test("rejects a missing BOM", () => {
        const text = csv([ROW_A], ".").slice(1);
        expect(csvFormatProblems(text, OPTS("."))).toEqual([
            expect.stringContaining("BOM"),
        ]);
    });

    test("rejects headers that differ from the locale JSON", () => {
        const text = csv([ROW_A], ".").replace("Header ciMin", "Min CI");
        expect(csvFormatProblems(text, OPTS("."))).toEqual([
            expect.stringContaining("header"),
        ]);
    });

    test("rejects a comma delimiter", () => {
        const text = csv([ROW_A], ".").replace(/;/g, ",");
        expect(csvFormatProblems(text, OPTS("."))).not.toEqual([]);
    });

    test("rejects the wrong decimal separator", () => {
        // comma file content in the dot file, and the reverse
        for (const problem of csvFormatProblems(csv([ROW_A], ","), OPTS("."))) {
            expect(problem).toContain("decimal");
        }
        expect(csvFormatProblems(csv([ROW_A], ","), OPTS("."))).not.toEqual([]);
        for (const problem of csvFormatProblems(csv([ROW_A], "."), OPTS(","))) {
            expect(problem).toContain("decimal");
        }
        expect(csvFormatProblems(csv([ROW_A], "."), OPTS(","))).not.toEqual([]);
    });

    test("rejects a quoted number and an unquoted text cell", () => {
        const quoted = csv([ROW_A], ".").replace(";100;", ';"100";');
        expect(csvFormatProblems(quoted, OPTS("."))).toEqual([
            expect.stringContaining("quoted"),
        ]);
        const bare = csv([ROW_A], ".").replace('"Cattle"', "Cattle");
        expect(csvFormatProblems(bare, OPTS("."))).toEqual([
            expect.stringContaining("quoted"),
        ]);
    });

    test("rejects a row with the wrong number of cells", () => {
        const text = csv([ROW_A], ".") + "\n2020;1";
        expect(csvFormatProblems(text, OPTS("."))).toEqual([
            expect.stringContaining("cells"),
        ]);
    });
});

test.describe("rowProblems", () => {
    test("accepts the same rows in any order, in either file", () => {
        expect(
            rowProblems(csv([ROW_B, ROW_A], "."), ".", [ROW_A, ROW_B])
        ).toEqual([]);
        expect(
            rowProblems(csv([ROW_B, ROW_A], ","), ",", [ROW_A, ROW_B])
        ).toEqual([]);
    });

    test("compares numbers numerically, unrounded", () => {
        expect(
            rowProblems(csv([ROW_A], "."), ".", [
                { ...ROW_A, percentageOfPositive: 7.51 },
            ])
        ).toEqual([
            expect.stringContaining("missing"),
            expect.stringContaining("unexpected"),
        ]);
    });

    test("fails an altered value", () => {
        const text = csv([ROW_A], ".").replace(";7;", ";8;");
        const problems = rowProblems(text, ".", [ROW_A]);
        expect(problems.length).toBeGreaterThan(0);
    });

    test("fails a missing row and an extra row", () => {
        expect(rowProblems(csv([ROW_A], "."), ".", [ROW_A, ROW_B])).toEqual([
            expect.stringContaining("missing"),
        ]);
        expect(rowProblems(csv([ROW_A, ROW_B], "."), ".", [ROW_A])).toEqual([
            expect.stringContaining("unexpected"),
        ]);
    });

    test("counts duplicates", () => {
        expect(rowProblems(csv([ROW_A, ROW_A], "."), ".", [ROW_A])).toEqual([
            expect.stringContaining("unexpected"),
        ]);
    });

    test("ignores whitespace runs in names, as the browser does", () => {
        const spaced = { ...ROW_A, matrix: "Cattle  faeces" };
        expect(
            rowProblems(csv([spaced], "."), ".", [
                { ...ROW_A, matrix: "Cattle faeces" },
            ])
        ).toEqual([]);
    });
});

test.describe("readmeProblems", () => {
    const de = "Dieser ZooNotify-Daten-Download enthält diese README-Datei";
    const en = "This ZooNotify data download contains this README-file";

    test("accepts the README in the page language", () => {
        expect(readmeProblems(de, "de")).toEqual([]);
        expect(readmeProblems(en, "en")).toEqual([]);
    });

    test("rejects the other language", () => {
        expect(readmeProblems(en, "de")).not.toEqual([]);
        expect(readmeProblems(de, "en")).not.toEqual([]);
    });
});

test.describe("zipEntryProblems", () => {
    const ts = "2026-11-03T10-00-00-000Z";
    const good = [
        `prevalence_data_dot_${ts}.csv`,
        `prevalence_data_comma_${ts}.csv`,
        `search_parameters_${ts}.txt`,
        `README_${ts}.txt`,
    ];

    test("accepts the four expected files", () => {
        expect(zipEntryProblems(good)).toEqual([]);
    });

    test("rejects a missing or extra file", () => {
        expect(zipEntryProblems(good.slice(1))).not.toEqual([]);
        expect(zipEntryProblems([...good, "other.txt"])).not.toEqual([]);
    });
});
