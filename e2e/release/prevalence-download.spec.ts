import { expect, test } from "@playwright/test";
import { readFile } from "fs/promises";
import JSZip from "jszip";
import { visit } from "../support/app";
import { releaseCheck } from "./support/annotations";
import { LANGUAGES, LOCALES } from "./support/locales";
import { loadPrevalenceItems, PrevalenceItem } from "./support/prevalence-api";
import {
    CSV_COLUMNS,
    ExpectedRow,
    csvFormatProblems,
    parseCsv,
    readmeProblems,
    rowProblems,
    zipEntryProblems,
} from "./support/prevalence-download";

/**
 * prevalence.data-download: the zip holds two CSVs, a README and the search
 * parameters; headers come from the locale JSON, the README is in the page
 * language, `_dot` uses ".", `_comma` uses ",", separator ";", BOM; and the rows
 * equal the API's rows for the same filter, numerically and unrounded.
 */
/** An API prevalence row as the client writes it into the CSV (absent values: "" and 0). */
function expectedRow(item: PrevalenceItem): ExpectedRow {
    return {
        samplingYear: item.samplingYear ?? 0,
        microorganism: item.microorganism?.name ?? "",
        sampleOrigin: item.sampleOrigin?.name ?? "",
        superCategorySampleOrigin: item.superCategorySampleOrigin?.name ?? "",
        samplingStage: item.samplingStage?.name ?? "",
        matrix: item.matrix?.name ?? "",
        matrixGroup: item.matrixGroup?.name ?? "",
        numberOfSamples: item.numberOfSamples ?? 0,
        numberOfPositive: item.numberOfPositive ?? 0,
        percentageOfPositive: item.percentageOfPositive ?? 0,
        ciMin: item.ciMin ?? 0,
        ciMax: item.ciMax ?? 0,
    };
}

for (const lang of LANGUAGES) {
    const strings = LOCALES[lang].prevalence;
    test(
        `prevalence data download, ${lang}`,
        { annotation: releaseCheck("prevalence.data-download", { lang }) },
        async ({ page, request }) => {
            // The filter: the microorganism of the first row, so the test needs
            // no pinned data. The page runs it from the URL, as a share link does.
            const all = await loadPrevalenceItems(request, lang);
            const micro = all.find((item) => item.microorganism)?.microorganism;
            if (!micro) {
                throw new Error(
                    "the API holds no prevalence row with a microorganism"
                );
            }

            const filtered = await loadPrevalenceItems(
                request,
                lang,
                undefined,
                `filters[microorganism][documentId][$in]=${encodeURIComponent(
                    micro.documentId
                )}`
            );
            expect(filtered.length).toBeGreaterThan(0);
            const expected = filtered.map(expectedRow);

            // The page first loads every row, then applies the URL filter. Wait
            // for the filtered request, so a dropped filter fails here and says so.
            const filterRequested = page
                .waitForResponse(
                    (r) =>
                        decodeURIComponent(r.url()).includes(
                            "filters[microorganism][documentId]"
                        ),
                    { timeout: 30_000 }
                )
                .catch(() => {
                    throw new Error(
                        `the page never requested the filter microorganism=${micro.name}: the URL filter was dropped`
                    );
                });
            await visit(
                page,
                `/prevalence?lang=${lang}&microorganism=${encodeURIComponent(
                    micro.name
                )}`
            );
            await filterRequested;
            const button = page.getByRole("button", {
                name: strings.DOWNLOAD_ZIP_FILE,
            });
            await expect(button).toBeVisible({ timeout: 30_000 });
            await expect(button).toBeEnabled();

            // The filtered answer is rendered a moment after it arrives, so
            // download until the file holds the filtered row count.
            let zip!: JSZip;
            const downloadRows = async (): Promise<number> => {
                const downloadPromise = page.waitForEvent("download");
                await button.click();
                const download = await downloadPromise;
                expect(download.suggestedFilename()).toMatch(
                    /^data_package_.+.zip$/
                );
                zip = await JSZip.loadAsync(
                    await readFile(await download.path())
                );
                const dot = Object.keys(zip.files).find((n) =>
                    /^prevalence_data_dot_/.test(n)
                );
                const text = dot ? await zip.file(dot)!.async("string") : "";
                return parseCsv(text).rows.length - 1;
            };
            await expect
                .poll(downloadRows, {
                    timeout: 20_000,
                    message: `the download should hold the ${expected.length} rows of microorganism=${micro.name} (the page did not apply the filter if it holds all rows)`,
                })
                .toBe(expected.length);

            const names = Object.keys(zip.files);
            expect(zipEntryProblems(names), "zip contents").toEqual([]);

            const read = (pattern: RegExp): Promise<string> =>
                zip.file(names.find((n) => pattern.test(n))!)!.async("string");

            const headers = CSV_COLUMNS.map(
                (c) => strings[c.label as keyof typeof strings] as string
            );
            for (const [decimal, pattern] of [
                [".", /^prevalence_data_dot_/],
                [",", /^prevalence_data_comma_/],
            ] as const) {
                const text = await read(pattern);
                expect(
                    csvFormatProblems(text, { decimal, headers }),
                    `format of ${pattern}`
                ).toEqual([]);
                expect(
                    rowProblems(text, decimal, expected),
                    `rows of ${pattern} against the API`
                ).toEqual([]);
            }

            expect(
                readmeProblems(await read(/^README_/), lang),
                "README language"
            ).toEqual([]);
        }
    );
}
