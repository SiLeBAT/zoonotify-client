import { normalise } from "./oracle";

/**
 * Rules for the prevalence "Data download" zip (check `prevalence.data-download`).
 * Pure functions over text, so an altered file can be unit-tested to fail
 * (`e2e/prevalence-download-parser.spec.ts`). Each returns a list of problems;
 * empty means the file is as the client promises.
 */

/** The 12 CSV columns in file order, with the `PrevalencePage.json` key of their header. */
export const CSV_COLUMNS = [
    { key: "samplingYear", label: "SAMPLING_YEAR", numeric: true },
    { key: "microorganism", label: "MICROORGANISM", numeric: false },
    { key: "sampleOrigin", label: "SAMPLE_ORIGIN", numeric: false },
    {
        key: "superCategorySampleOrigin",
        label: "SUPER-CATEGORY-SAMPLE-ORIGIN",
        numeric: false,
    },
    { key: "samplingStage", label: "SAMPLING_STAGE", numeric: false },
    { key: "matrix", label: "MATRIX", numeric: false },
    { key: "matrixGroup", label: "MATRIX_GROUP", numeric: false },
    { key: "numberOfSamples", label: "NUMBER_OF_SAMPLES", numeric: true },
    { key: "numberOfPositive", label: "NUMBER_OF_POSITIVE", numeric: true },
    {
        key: "percentageOfPositive",
        label: "PERCENTAGE_OF_POSITIVE",
        numeric: true,
    },
    { key: "ciMin", label: "CIMIN", numeric: true },
    { key: "ciMax", label: "CIMAX", numeric: true },
] as const;

type ColumnKey = (typeof CSV_COLUMNS)[number]["key"];

/** One expected CSV row: numbers as numbers, relation names as text ("" when absent). */
export type ExpectedRow = Record<ColumnKey, string | number>;

export interface Cell {
    value: string;
    quoted: boolean;
}

export interface ParsedCsv {
    bom: boolean;
    rows: Cell[][];
}

const BOM = "﻿";
const DELIMITER = ";";

/** Parses `;`-separated text with `"` quoting and `""` escapes; rows end at an unquoted `\n`. */
export function parseCsv(text: string): ParsedCsv {
    const bom = text.startsWith(BOM);
    const body = bom ? text.slice(1) : text;
    const rows: Cell[][] = [];
    let row: Cell[] = [];
    let value = "";
    let quoted = false;
    let inQuotes = false;
    let pending = false; // something was read since the last row ended

    const endCell = (): void => {
        row.push({ value, quoted });
        value = "";
        quoted = false;
    };

    for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        pending = true;
        if (inQuotes) {
            if (ch === '"' && body[i + 1] === '"') {
                value += '"';
                i++;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                value += ch;
            }
        } else if (ch === '"' && value === "" && !quoted) {
            inQuotes = true;
            quoted = true;
        } else if (ch === DELIMITER) {
            endCell();
        } else if (ch === "\n") {
            endCell();
            rows.push(row);
            row = [];
            pending = false;
        } else {
            value += ch;
        }
    }
    if (pending) {
        endCell();
        rows.push(row);
    }
    return { bom, rows };
}

export interface FormatOptions {
    /** `.` for the `_dot` file, `,` for the `_comma` file. */
    decimal: string;
    /** The expected header cells, from the locale JSON, in column order. */
    headers: string[];
}

/** BOM, header row, cell count, quoting and decimal separator of every row. */
export function csvFormatProblems(
    text: string,
    { decimal, headers }: FormatOptions
): string[] {
    const problems: string[] = [];
    const { bom, rows } = parseCsv(text);
    if (!bom) problems.push("the file does not start with a UTF-8 BOM");
    if (rows.length === 0) return [...problems, "the file has no rows"];

    const actualHeaders = rows[0].map((c) => c.value);
    if (JSON.stringify(actualHeaders) !== JSON.stringify(headers)) {
        problems.push(
            `header row differs from the locale JSON: ${JSON.stringify(
                actualHeaders
            )} vs ${JSON.stringify(headers)}`
        );
    }

    const other = decimal === "." ? "," : ".";
    const numberShape = new RegExp(
        `^-?\\d+(${decimal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\d+)?$`
    );
    const reported = new Set<string>();
    const report = (message: string): void => {
        if (!reported.has(message)) {
            reported.add(message);
            problems.push(message);
        }
    };

    rows.slice(1).forEach((row, index) => {
        const at = `row ${index + 2}`;
        if (row.length !== CSV_COLUMNS.length) {
            report(
                `${at} has ${row.length} cells, expected ${CSV_COLUMNS.length}`
            );
            return;
        }
        row.forEach((cell, col) => {
            const column = CSV_COLUMNS[col];
            if (column.numeric) {
                if (cell.quoted) {
                    report(`${column.key} is quoted but should not be (${at})`);
                } else if (!numberShape.test(cell.value)) {
                    report(
                        cell.value.includes(other)
                            ? `${column.key} uses the wrong decimal separator, expected "${decimal}" (${at}: ${cell.value})`
                            : `${column.key} is not a plain number (${at}: ${cell.value})`
                    );
                }
            } else if (!cell.quoted) {
                report(`${column.key} is not quoted (${at}: ${cell.value})`);
            }
        });
    });
    return problems;
}

/** A canonical form of a row for set comparison: names whitespace-normalised, numbers as numbers. */
function rowKey(values: Array<string | number>): string {
    return JSON.stringify(
        values.map((v, i) =>
            CSV_COLUMNS[i].numeric ? Number(v) : normalise(String(v))
        )
    );
}

function countKeys(keys: string[]): Map<string, number> {
    const map = new Map<string, number>();
    keys.forEach((k) => map.set(k, (map.get(k) ?? 0) + 1));
    return map;
}

/** Keys of `from` that occur more often than in `minus`, once per surplus. */
function surplus(
    from: Map<string, number>,
    minus: Map<string, number>
): string[] {
    const out: string[] = [];
    from.forEach((n, k) => {
        for (let i = 0; i < n - (minus.get(k) ?? 0); i++) out.push(k);
    });
    return out;
}

/**
 * Rows of the CSV against the API's rows for the same filter, as multisets:
 * the client does not sort the file. Numbers are read with the file's own
 * decimal separator and must equal the API's value exactly (unrounded).
 */
export function rowProblems(
    text: string,
    decimal: string,
    expected: ExpectedRow[]
): string[] {
    const { rows } = parseCsv(text);
    const actual = countKeys(
        rows
            .slice(1)
            .map((row) =>
                rowKey(
                    row.map((cell, i) =>
                        CSV_COLUMNS[i]?.numeric
                            ? cell.value.replace(decimal, ".")
                            : cell.value
                    )
                )
            )
    );
    const wanted = countKeys(
        expected.map((row) => rowKey(CSV_COLUMNS.map((c) => row[c.key])))
    );

    const problems: string[] = [];
    const missing = surplus(wanted, actual);
    const unexpected = surplus(actual, wanted);
    const sample = (keys: string[]): string => keys.slice(0, 3).join("\n  ");
    if (missing.length > 0) {
        problems.push(
            `${
                missing.length
            } API row(s) missing from the CSV, e.g.\n  ${sample(missing)}`
        );
    }
    if (unexpected.length > 0) {
        problems.push(
            `${
                unexpected.length
            } CSV row(s) unexpected (not in the API for this filter), e.g.\n  ${sample(
                unexpected
            )}`
        );
    }
    return problems;
}

/** The first words of the client's two hard-coded READMEs. */
const README_START = {
    de: "Dieser ZooNotify-Daten-Download",
    en: "This ZooNotify data download",
} as const;

/** The README is the one in the page language, and not the other. */
export function readmeProblems(text: string, lang: "de" | "en"): string[] {
    const other = lang === "de" ? "en" : "de";
    const problems: string[] = [];
    if (!text.includes(README_START[lang])) {
        problems.push(`README does not start like the ${lang} README`);
    }
    if (text.includes(README_START[other])) {
        problems.push(`README is the ${other} text on a ${lang} page`);
    }
    return problems;
}

const ZIP_ENTRY_PATTERNS = [
    /^prevalence_data_dot_.+\.csv$/,
    /^prevalence_data_comma_.+\.csv$/,
    /^search_parameters_.+\.txt$/,
    /^README_.+\.txt$/,
];

/** The zip holds exactly the two CSVs, the search parameters and the README. */
export function zipEntryProblems(names: string[]): string[] {
    const problems: string[] = [];
    for (const pattern of ZIP_ENTRY_PATTERNS) {
        if (names.filter((n) => pattern.test(n)).length !== 1) {
            problems.push(`expected exactly one file matching ${pattern}`);
        }
    }
    const extra = names.filter(
        (n) => !ZIP_ENTRY_PATTERNS.some((p) => p.test(n))
    );
    if (extra.length > 0)
        problems.push(`unexpected files: ${extra.join(", ")}`);
    return problems;
}
