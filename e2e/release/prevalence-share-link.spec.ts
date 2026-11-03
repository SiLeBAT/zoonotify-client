import { expect, Locator, Page, test } from "@playwright/test";
import prevalenceDe from "../../src/locales/de/PrevalencePage.json";
import prevalenceEn from "../../src/locales/en/PrevalencePage.json";
import { visit } from "../support/app";
import { releaseCheck } from "./support/annotations";
import { normalise } from "./support/oracle";

/**
 * prevalence.share-link: the link the "Share Link" button copies restores the
 * query in a fresh browser context -- selections, language, table row count and
 * the plotted organism.
 *
 * Not carried, by design, and therefore not asserted: the combinations picked
 * above the chart and the year range slider. They are view-only and reset to
 * their defaults when the link is opened.
 */
const LOCALES = { de: prevalenceDe, en: prevalenceEn } as const;

function combobox(page: Page, label: string): Locator {
    // MUI puts the selected value into the accessible name, so match a prefix.
    return page.getByRole("combobox", {
        name: new RegExp("^" + label + "(\\s|$)"),
    });
}

/** Chooses "Select All" in a multi-select. */
async function selectAll(
    page: Page,
    label: string,
    all: string
): Promise<void> {
    await combobox(page, label).click();
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    await listbox.getByRole("option", { name: all }).click();
    await page.keyboard.press("Escape");
    await expect(listbox).toBeHidden();
}

/** What the page shows for this query, read from the page itself. */
async function snapshot(page: Page, labels: typeof prevalenceEn) {
    const text = async (label: string) =>
        normalise(await combobox(page, label).innerText());
    const grid = page.getByRole("grid");
    await expect(grid).toBeVisible({ timeout: 30_000 });
    return {
        lang: new URL(page.url()).searchParams.get("lang"),
        year: await text(labels.SAMPLING_YEAR),
        microorganism: await text(labels.MICROORGANISM),
        // aria-rowcount counts the header row too.
        rowCount: await grid.getAttribute("aria-rowcount"),
        chartMicroorganism: normalise(
            await combobox(page, labels.Select_Microorganism).innerText()
        ),
    };
}

for (const [lang, labels] of Object.entries(LOCALES)) {
    test(
        `prevalence share link restores the query, ${lang}`,
        {
            annotation: releaseCheck("prevalence.share-link", { lang }),
        },
        async ({ browser, baseURL }) => {
            const source = await browser.newContext({
                permissions: ["clipboard-read", "clipboard-write"],
            });
            const page = await source.newPage();
            await visit(page, `/prevalence?lang=${lang}`);

            await selectAll(page, labels.MICROORGANISM, labels.SELECT_ALL);
            await selectAll(page, labels.SAMPLING_YEAR, labels.SELECT_ALL);
            await page.getByRole("button", { name: labels.SEARCH }).click();
            await expect(page.getByRole("grid")).toBeVisible({
                timeout: 30_000,
            });

            // Plot the second organism, so a restored default would show.
            await combobox(page, labels.Select_Microorganism).click();
            const chartOptions = page.getByRole("listbox").getByRole("option");
            await expect(chartOptions.first()).toBeVisible();
            test.skip(
                (await chartOptions.count()) < 2,
                "needs two organisms with data to tell a restored chart organism from the default"
            );
            await chartOptions.nth(1).click();
            await expect(page).toHaveURL(/chartMicro=/);

            const before = await snapshot(page, labels);
            expect(before.rowCount, "the search found rows").not.toBe("1");

            await page.getByRole("button", { name: labels.Share_Link }).click();
            const copied = await page.evaluate(() =>
                navigator.clipboard.readText()
            );
            expect(copied).toContain(new URL(baseURL ?? page.url()).host);
            await source.close();

            const fresh = await browser.newContext();
            const freshPage = await fresh.newPage();
            await freshPage.goto(copied);
            expect(await snapshot(freshPage, labels)).toEqual(before);
            await fresh.close();
        }
    );
}
