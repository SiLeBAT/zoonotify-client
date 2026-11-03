import { expect, test } from "@playwright/test";
import { readFile } from "fs/promises";
import JSZip from "jszip";
import prevalenceDe from "../../src/locales/de/PrevalencePage.json";
import prevalenceEn from "../../src/locales/en/PrevalencePage.json";
import { visit } from "../support/app";
import { releaseCheck } from "./support/annotations";
import { PAGE_SIZE, apiGetAll } from "./support/oracle";
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
const LANGUAGES = { de: prevalenceDe, en: prevalenceEn } as const;

const POPULATE = [
    "matrix",
    "microorganism",
    "samplingStage",
    "matrixGroup",
    "sampleOrigin",
    "superCategorySampleOrigin",
]
    .map((relation) => `populate=${relation}`)
    .join("&");

/** An API prevalence row as the client writes it into the CSV (absent values: "" and 0). */
function expectedRow(item: any): ExpectedRow {
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

for (const [lang, strings] of Object.entries(LANGUAGES) as [
    "de" | "en",
    typeof prevalenceDe
][]) {
    test(
        `prevalence data download, ${lang}`,
        { annotation: releaseCheck("prevalence.data-download", { lang }) },
        async ({ page, request }) => {
            // The filter: the microorganism of the first row, so the test needs
            // no pinned data. The page runs it from the URL, as a share link does.
            const all = await apiGetAll(
                request,
                `/prevalences?${POPULATE}`,
                PAGE_SIZE.prevalence,
                lang
            );
            const micro = all.find((item) => item.microorganism)?.microorganism;
            expect(micro, "the API holds a prevalence row").toBeTruthy();

            const filtered = await apiGetAll(
                request,
                `/prevalences?${POPULATE}&filters[microorganism][documentId][$in]=${encodeURIComponent(
                    micro.documentId
                )}`,
                PAGE_SIZE.prevalence,
                lang
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
            // The page mounts its data provider more than once on load, so the
            // unfiltered and filtered answers can land in either order. Settle,
            // then search again with the filter the URL selected: the last
            // answer is then the filtered one.
            await page.waitForLoadState("networkidle");
            const searched = page.waitForResponse((r) =>
                decodeURIComponent(r.url()).includes(
                    "filters[microorganism][documentId]"
                )
            );
            await page.getByRole("button", { name: strings.SEARCH }).click();
            await searched;
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
