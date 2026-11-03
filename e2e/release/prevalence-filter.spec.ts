import { expect, test } from "@playwright/test";
import { releaseCheck } from "./support/annotations";
import { LOCALES } from "./support/locales";
import {
    chooseFilterValue,
    DIMENSIONS,
    Dimension,
    expectFacet,
    facetOptions,
    FILTER_URL_PARAMS,
    loadFacetRows,
    openPrevalencePage,
    Selection,
    selectAllLabels,
    shownValue,
    filterSelect,
    openOptions,
} from "./support/prevalence-filters";
import { closeSelect } from "./support/select";

/**
 * prevalence.data-filter and prevalence.reset-filter. Expected options are the
 * facets of the site's own /api/prevalences, with the client's quirks (see
 * support/prevalence-filters.ts). Level 1 (every filter opens a non-empty
 * dropdown) also runs on production; level 2 (options match the oracle, and the
 * cascade narrows) is RC only.
 */
const labels = LOCALES.en.prevalence as Record<string, string>;

test(
    "prevalence data filter, level 1: every filter opens a dropdown with options @post-release",
    {
        tag: "@post-release",
        annotation: releaseCheck("prevalence.data-filter", { level: "1" }),
    },
    async ({ page }) => {
        await openPrevalencePage(page, "en", labels);
        for (const { dim, labelId } of DIMENSIONS) {
            const shown = await openOptions(
                page,
                filterSelect(page, labelId),
                selectAllLabels(labels)
            );
            await closeSelect(page);
            expect(shown.length, `${dim} has options`).toBeGreaterThan(0);
        }
    }
);

test(
    "prevalence data filter, level 2: options follow the faceted cascade",
    { annotation: releaseCheck("prevalence.data-filter", { level: "2" }) },
    async ({ page, request }) => {
        const rows = await loadFacetRows(request, "en");
        await openPrevalencePage(page, "en", labels);

        const all = DIMENSIONS.map((d) => d.dim);
        const unfiltered: Record<string, number> = {};
        for (const dim of all) {
            unfiltered[dim] = (
                await expectFacet(page, labels, rows, {}, dim)
            ).length;
        }

        // Choose a super-category, then a microorganism it leaves; every other
        // dropdown must narrow to exactly the API subset.
        const selection: Selection = {};
        let narrowed = false;
        for (const dim of ["superCategory", "microorganism"] as Dimension[]) {
            const option = facetOptions(rows, selection, dim)[0];
            expect(option, `${dim} offers a value to choose`).toBeTruthy();
            await chooseFilterValue(page, labels, dim, option.name);
            selection[dim] = [option.id];
            for (const other of all) {
                const shown = await expectFacet(
                    page,
                    labels,
                    rows,
                    selection,
                    other
                );
                if (other !== dim && shown.length < unfiltered[other]) {
                    narrowed = true;
                }
            }
        }
        expect(narrowed, "a choice narrows at least one other filter").toBe(
            true
        );
    }
);

test(
    "prevalence reset filter button clears selections, results and URL",
    { annotation: releaseCheck("prevalence.reset-filter") },
    async ({ page, request }) => {
        const rows = await loadFacetRows(request, "en");
        await openPrevalencePage(page, "en", labels);

        const selection: Selection = {};
        for (const dim of ["superCategory", "microorganism"] as Dimension[]) {
            const option = facetOptions(rows, selection, dim)[0];
            await chooseFilterValue(page, labels, dim, option.name);
            selection[dim] = [option.id];
        }
        await page
            .getByRole("button", { name: labels.SEARCH, exact: true })
            .click();
        await expect(page.getByRole("grid")).toBeVisible({ timeout: 30_000 });
        await expect(page.locator("canvas").first()).toBeVisible();
        expect(await shownValue(page, labels, "microorganism")).not.toBe("");

        await page
            .getByRole("button", { name: labels.RESET_FILTERS, exact: true })
            .click();

        for (const { dim } of DIMENSIONS) {
            await expect
                .poll(() => shownValue(page, labels, dim), {
                    message: `${dim} selection is empty`,
                })
                .toBe("");
        }
        const params = new URL(page.url()).searchParams;
        for (const key of FILTER_URL_PARAMS) {
            expect(params.has(key), `URL keeps no "${key}"`).toBe(false);
        }
        await expect(page.getByRole("grid")).toHaveCount(0);
        await expect(page.locator("canvas")).toHaveCount(0);

        for (const { dim } of DIMENSIONS) {
            await expectFacet(page, labels, rows, {}, dim);
        }
    }
);
