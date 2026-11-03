import { expect, Locator, Page, test } from "@playwright/test";
import prevalenceDe from "../../src/locales/de/PrevalencePage.json";
import prevalenceEn from "../../src/locales/en/PrevalencePage.json";
import { languageButton } from "../support/app";
import { releaseCheck } from "./support/annotations";
import {
    clearDraws,
    drawnYears,
    installCanvasSpy,
    latestPass,
    recordedDraws,
    titleProblems,
} from "./support/canvas-spy";
import { Locale, normalise } from "./support/oracle";
import {
    combinationsOf,
    legendProblems,
    pickScenario,
    prevalenceRows,
    Scenario,
    yearsOf,
} from "./support/prevalence-figure";
import { reportOutcome } from "./support/annotations";

/**
 * prevalence.figure-download, prevalence.change-language and
 * prevalence.filter-above-graph. The figure is a canvas, so its text comes
 * from the canvas spy; expected values come from the locale JSON and the
 * site's own API, for a sample origin picked from live data.
 */
const LOCALES = { en: prevalenceEn, de: prevalenceDe } as const;
const PLOTTED_TITLE_FONT = /\b19px Arial$/;

interface Data {
    scenario: Scenario;
    en: Awaited<ReturnType<typeof prevalenceRows>>;
    de: Awaited<ReturnType<typeof prevalenceRows>>;
}

async function load(
    request: Parameters<typeof prevalenceRows>[0]
): Promise<Data | null> {
    const [en, de] = [
        await prevalenceRows(request, "en"),
        await prevalenceRows(request, "de"),
    ];
    const scenario = pickScenario(en, de);
    return scenario ? { scenario, en, de } : null;
}

const rowsFor = (data: Data, lang: Locale) => data[lang];

const microName = (data: Data, lang: Locale, id: string): string =>
    data.scenario.microorganisms[lang][
        data.scenario.microorganismIds.indexOf(id)
    ];

/** Legend texts of a pass: combination labels, not drawn in the title font. */
function legendOf(pass: { text: string; font: string }[]): string[] {
    return pass
        .filter(
            (d) =>
                !PLOTTED_TITLE_FONT.test(d.font) && d.text.split("-").length > 2
        )
        .map((d) => d.text);
}

function chartSelect(page: Page, lang: Locale): Locator {
    const label = LOCALES[lang].Select_Microorganism;
    return page.getByRole("combobox", {
        name: new RegExp(`^${label}(\\s|$)`),
    });
}

const spied = new WeakSet<Page>();

/**
 * Opens the prevalence page, picks the scenario's sample origin in the filter
 * panel, searches and plots `micro`. Driven through the UI on purpose: a deep
 * link re-fetches the unfiltered data after the search on some builds (see the
 * report), which would make the chart flip back.
 */
async function openChart(
    page: Page,
    data: Data,
    lang: Locale,
    micro: string,
    { narrow = true, choose = true } = {}
): Promise<boolean> {
    if (!spied.has(page)) {
        await installCanvasSpy(page);
        spied.add(page);
    }
    await page.goto(`/prevalence?lang=${lang}`);
    await page.waitForLoadState("networkidle");
    const labels = LOCALES[lang];
    const origin = data.scenario.origin[lang];
    const name = microName(data, lang, micro);
    await pickFilterOption(
        page,
        labels.SAMPLE_ORIGIN,
        (text) => normalise(text) === origin
    );
    // Narrowing to the organism makes it the one plotted first, so a figure
    // check does not depend on the organism switch (a separate check).
    let narrowed = false;
    if (narrow) {
        narrowed = await pickFilterOption(
            page,
            labels.MICROORGANISM,
            (text) => squash(text) === squash(name),
            { optional: true }
        );
    }
    await page
        .getByRole("button", { name: labels.SEARCH, exact: true })
        .click();
    await expect(page.locator("canvas").first()).toBeVisible({
        timeout: 60_000,
    });
    await page.waitForLoadState("networkidle");
    if (choose) await chooseChartMicro(page, lang, name);
    return narrowed;
}

/**
 * Organism names render with blanks around hyphens ("CARBA - E. coli"), so
 * names are compared with those blanks squashed on both sides.
 */
const squash = (text: string): string =>
    normalise(text).replace(/\s*-\s*/g, "-");

async function chartMicroShown(page: Page, lang: Locale): Promise<string> {
    return squash(await chartSelect(page, lang).innerText());
}

/** Selects an organism in the filter above the graph, unless already shown. */
async function chooseChartMicro(page: Page, lang: Locale, name: string) {
    if ((await chartMicroShown(page, lang)) !== squash(name)) {
        await chartSelect(page, lang).click();
        const texts = await page.getByRole("option").allTextContents();
        const index = texts.map(squash).indexOf(squash(name));
        expect(index, `option for ${name}`).toBeGreaterThanOrEqual(0);
        await page.getByRole("option").nth(index).click();
    }
    await expect.poll(() => chartMicroShown(page, lang)).toBe(squash(name));
}

/**
 * Picks one option in a left-panel filter. Focus + key rather than a click: at
 * 360 px the info icon sits over the select.
 */
async function pickFilterOption(
    page: Page,
    label: string,
    matches: (optionText: string) => boolean,
    { optional = false } = {}
): Promise<boolean> {
    const filter = page.getByRole("combobox", {
        name: new RegExp(`^${escapeRegExp(label)}(\s|$)`),
    });
    await filter.focus();
    await filter.press("Enter");
    const texts = await page.getByRole("option").allTextContents();
    const index = texts.findIndex(matches);
    if (index < 0 && optional) {
        await page.keyboard.press("Escape");
        return false;
    }
    expect(index, `"${label}" offers the option`).toBeGreaterThanOrEqual(0);
    await page.getByRole("option").nth(index).click();
    await page.keyboard.press("Escape");
    return true;
}

const escapeRegExp = (text: string): string =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Waits until the visible chart's latest pass has a title, returns that pass. */
async function onScreenPass(page: Page, name: string) {
    await expect
        .poll(
            async () =>
                titleProblems(
                    latestPass(await recordedDraws(page), true),
                    name
                ),
            { timeout: 30_000 }
        )
        .toEqual([]);
    return latestPass(await recordedDraws(page), true);
}

test(
    "prevalence figure download: text, legend, years and file",
    {
        annotation: releaseCheck("prevalence.figure-download"),
    },
    async ({ page, request }, testInfo) => {
        const data = await load(request);
        if (!data) {
            reportOutcome(
                testInfo,
                "skipped-no-data",
                "no sample origin has two microorganisms"
            );
            return;
        }
        const { scenario } = data;
        const id = scenario.figureMicroId;

        for (const lang of ["en", "de"] as const) {
            await test.step(`figure in ${lang}`, async () => {
                const labels = LOCALES[lang];
                const name = microName(data, lang, id);
                await openChart(page, data, lang, id);
                await onScreenPass(page, name);
                await clearDraws(page);

                const [download] = await Promise.all([
                    page.waitForEvent("download"),
                    page
                        .getByRole("button", { name: labels.Download_Chart })
                        .click(),
                ]);
                const draws = await recordedDraws(page);
                const figure = latestPass(draws, false);
                const texts = figure.map((d) => d.text);

                // The file: named after the organism, a 1380x1000 PNG, not blank.
                expect(download.suggestedFilename()).toMatch(
                    /^[A-Za-z0-9_-]+-\d{8}T\d{9}Z\.png$/
                );
                const path = await download.path();
                const png = await (
                    await import("node:fs/promises")
                ).readFile(path);
                expect(png.subarray(1, 4).toString(), "PNG signature").toBe(
                    "PNG"
                );
                expect(png.readUInt32BE(16), "width").toBe(1380);
                expect(png.readUInt32BE(20), "height").toBe(1000);
                const inked = await page.evaluate(async (b64) => {
                    const img = new Image();
                    img.src = `data:image/png;base64,${b64}`;
                    await img.decode();
                    const c = document.createElement("canvas");
                    c.width = img.width;
                    c.height = img.height;
                    const ctx = c.getContext("2d")!;
                    ctx.drawImage(img, 0, 0);
                    const px = ctx.getImageData(0, 0, c.width, c.height).data;
                    let n = 0;
                    for (let i = 0; i < px.length; i += 4) {
                        if (px[i] < 200 || px[i + 1] < 200 || px[i + 2] < 200)
                            n++;
                    }
                    return n;
                }, png.toString("base64"));
                expect(inked, "the figure is not blank").toBeGreaterThan(1000);

                // Text drawn on it.
                expect(figure.length, "the export drew text").toBeGreaterThan(
                    0
                );
                expect(titleProblems(figure, name)).toEqual([]);
                expect(texts).toContain(labels["Prevalence %"]);
                expect(texts).toContain(labels.Year);
                const modified = texts.find((t) =>
                    t.startsWith(`${labels["Generated on"]}: `)
                );
                expect(modified, "last-modified line").toBeTruthy();
                expect(
                    modified!.slice(labels["Generated on"].length + 2)
                ).not.toBe("");

                const rows = rowsFor(data, lang);
                const combos = combinationsOf(rows, scenario.originId, id);
                expect(legendProblems(legendOf(figure), combos)).toEqual([]);
                const plotted = legendOf(figure).map(normalise);
                const expectedYears = yearsOf(
                    rows,
                    scenario.originId,
                    id,
                    combos.length <= 4 ? combos : plotted
                );
                expect(Array.from(new Set(drawnYears(figure))).sort()).toEqual(
                    expectedYears.map(Number).sort()
                );
            });
        }
    }
);

test(
    "prevalence change language keeps selections and re-labels the chart",
    { annotation: releaseCheck("prevalence.change-language") },
    async ({ page, request }, testInfo) => {
        const data = await load(request);
        if (!data) {
            reportOutcome(
                testInfo,
                "skipped-no-data",
                "no sample origin has two microorganisms"
            );
            return;
        }
        const { scenario } = data;
        const id = scenario.figureMicroId;
        const enName = microName(data, "en", id);
        const narrowed = await openChart(page, data, "en", id);
        await onScreenPass(page, enName);
        await clearDraws(page);

        await languageButton(page, "de").click();
        await expect(chartSelect(page, "de")).toBeVisible({ timeout: 30_000 });
        const de = prevalenceDe;

        // Labels equal the new locale JSON.
        await expect(
            page.getByRole("button", { name: de.Download_Chart })
        ).toBeVisible();
        await expect(
            page.getByRole("button", { name: de.DOWNLOAD_ZIP_FILE })
        ).toBeVisible();
        await expect(page.getByText(de.Chart_Year_Range).first()).toBeVisible();
        await expect(page.getByText(de.Combinations).first()).toBeVisible();
        expect(new URL(page.url()).searchParams.get("lang")).toBe("de");

        // The selection survived: same sample origin (new name), same organism.
        const deOrigin = scenario.origin.de;
        const deName = microName(data, "de", id);
        await expect(page.getByText(deOrigin).first()).toBeVisible();
        expect(await chartMicroShown(page, "de")).toBe(squash(deName));

        // Option names equal the API's names in the new locale.
        await chartSelect(page, "de").click();
        const options = (await page.getByRole("option").allTextContents())
            .map(squash)
            .sort();
        await page.keyboard.press("Escape");
        // Narrowed to one organism, the chart offers just that one.
        expect(options).toEqual(
            narrowed
                ? [squash(deName)]
                : scenario.microorganisms.de.map(squash).sort()
        );

        // The canvas: title, legend and year labels in the new locale.
        // The search re-runs after the switch; the legend follows the data.
        const deCombos = combinationsOf(data.de, scenario.originId, id);
        await expect
            .poll(
                async () =>
                    legendProblems(
                        legendOf(latestPass(await recordedDraws(page), true)),
                        deCombos
                    ),
                { timeout: 30_000 }
            )
            .toEqual([]);
        const pass = await onScreenPass(page, deName);
        const texts = pass.map((d) => d.text);
        expect(texts).toContain(de["Prevalence %"]);
        expect(texts).toContain(de.Year);
    }
);

test(
    "prevalence filter above the graph switches the plotted organism",
    { annotation: releaseCheck("prevalence.filter-above-graph") },
    async ({ page, request }, testInfo) => {
        const data = await load(request);
        if (!data) {
            reportOutcome(
                testInfo,
                "skipped-no-data",
                "no sample origin has two microorganisms"
            );
            return;
        }
        const { scenario } = data;
        const ids = scenario.microorganismIds;
        await openChart(page, data, "en", ids[0], {
            narrow: false,
            choose: false,
        });
        // The chart starts on its first organism; every other follows.
        await expect.poll(() => chartMicroShown(page, "en")).not.toBe("");
        const shown = await chartMicroShown(page, "en");
        const first =
            ids.find((id) => squash(microName(data, "en", id)) === shown) ??
            ids[0];
        await onScreenPass(page, microName(data, "en", first));
        ids.sort((a, b) => Number(b === first) - Number(a === first));

        // Every organism the origin has, in turn (the first is already shown).
        let pinned: string[] | null = null;
        for (const id of ids) {
            const name = microName(data, "en", id);
            await test.step(`select ${name}`, async () => {
                await chooseChartMicro(page, "en", name);
                const combos = combinationsOf(data.en, scenario.originId, id);
                // The first organism plots its first combinations. A switch
                // keeps what was on screen, so a later organism plots those of
                // them it has (by design, see PrevalenceChart).
                const kept =
                    pinned === null
                        ? null
                        : pinned.filter((c) => combos.includes(c));
                await expect
                    .poll(async () => {
                        const legend = legendOf(
                            latestPass(await recordedDraws(page), true)
                        ).map(normalise);
                        return kept === null
                            ? legendProblems(legend, combos)
                            : [
                                  ...legend.filter((c) => !kept.includes(c)),
                                  ...kept.filter((c) => !legend.includes(c)),
                              ];
                    })
                    .toEqual([]);
                if (pinned === null) {
                    pinned = legendOf(
                        latestPass(await recordedDraws(page), true)
                    ).map(normalise);
                }
                const pass = latestPass(await recordedDraws(page), true);
                expect
                    .soft(titleProblems(pass, name), "chart title")
                    .toEqual([]);
                await expect
                    .poll(() =>
                        normalise(
                            new URL(page.url()).searchParams.get(
                                "chartMicro"
                            ) ?? ""
                        )
                    )
                    .toBe(normalise(name));

                // Year slider spans the organism's years; drawn years stay inside.
                const years = yearsOf(data.en, scenario.originId, id);
                const drawn = drawnYears(pass);
                if (years.length >= 2) {
                    const lo = page.getByRole("slider").first();
                    await expect(lo).toHaveAttribute(
                        "aria-valuemin",
                        String(years[0])
                    );
                    await expect(lo).toHaveAttribute(
                        "aria-valuemax",
                        String(years[years.length - 1])
                    );
                }
                for (const y of drawn) expect(years).toContain(y);

                // Narrowing the range from below leaves no earlier year drawn.
                if (years.length >= 3 && id === ids[ids.length - 1]) {
                    const lo = page.getByRole("slider").first();
                    await lo.focus();
                    await lo.press("ArrowRight");
                    const newLo = Number(
                        await lo.getAttribute("aria-valuenow")
                    );
                    expect(newLo).toBeGreaterThan(years[0]);
                    await expect
                        .poll(async () =>
                            Math.min(
                                ...drawnYears(
                                    latestPass(await recordedDraws(page), true)
                                )
                            )
                        )
                        .toBeGreaterThanOrEqual(newLo);
                }
            });
        }
    }
);

/**
 * Evidence for the manual prevalence.small-screen check: the chart at 360 px,
 * attached to the report. It decides nothing.
 */
test(
    "prevalence chart on a 360 px screen (evidence)",
    { annotation: releaseCheck("prevalence.small-screen") },
    async ({ page, request }, testInfo) => {
        const data = await load(request);
        if (!data) {
            reportOutcome(
                testInfo,
                "skipped-no-data",
                "no sample origin has two microorganisms"
            );
            return;
        }
        const id = data.scenario.figureMicroId;
        await openChart(page, data, "en", id);
        // Then the phone: collapse the filter panel as a user would, so the
        // chart has the screen.
        await page.setViewportSize({ width: 360, height: 780 });
        await page.getByRole("button", { name: "apply filter" }).click();
        const canvas = page.locator("canvas").first();
        await canvas.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1_000);
        await onScreenPass(page, microName(data, "en", id));
        // The viewport, not the canvas: the judgement is the chart as a phone
        // user meets it, including how much room the page leaves it.
        await testInfo.attach("prevalence.small-screen", {
            body: await page.screenshot(),
            contentType: "image/png",
        });
    }
);

/**
 * Canary for the italic assertion: serve the app's bundle with the italic title
 * font turned upright and expect the check to notice. Not a release check.
 */
test("canary: an upright organism word fails the italic assertion", async ({
    page,
    request,
}) => {
    const data = await load(request);
    test.skip(!data, "no sample origin has two microorganisms");
    let patched = 0;
    await page.route(/\.js(\?.*)?$/, async (route) => {
        const response = await route.fetch();
        const body = await response.text();
        if (body.includes("italic bold 19px Arial")) {
            patched++;
            await route.fulfill({
                response,
                body: body
                    .split("italic bold 19px Arial")
                    .join("bold 19px Arial"),
            });
        } else {
            await route.fulfill({ response, body });
        }
    });
    const id = data!.scenario.figureMicroId;
    const name = microName(data!, "en", id);
    await openChart(page, data!, "en", id);
    await expect
        .poll(async () => latestPass(await recordedDraws(page), true).length, {
            timeout: 30_000,
        })
        .toBeGreaterThan(0);
    expect(
        patched,
        "the bundle holding the title font was patched"
    ).toBeGreaterThan(0);
    const problems = titleProblems(
        latestPass(await recordedDraws(page), true),
        name
    );
    expect(problems.join("; ")).toContain("should be italic");
});
