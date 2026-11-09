import { expect, Page, test } from "@playwright/test";
import { visit } from "../support/app";
import { releaseCheck, reportOutcome } from "./support/annotations";
import {
    dropdownOptionNames,
    facetNames,
    FILTER_LABELS,
    FilterKey,
    filterDropdown,
    filterKeys,
    ORGANISMS,
    resistanceRows,
    rowsWhere,
    VIEWS,
} from "./support/amr-filters";
import { checkTrendInfoButton } from "./support/amr-info-button";
import { LANGUAGES } from "./support/locales";
import { chooseOption, diffNames } from "./support/select";

/**
 * amr.filter: for every organism the AMR page lists, in the Trend and the
 * Substance view, the filter dropdowns hold exactly what the organism's data
 * holds (level 1, also run after release) and choosing a super-category
 * narrows the matrix list to what the data allows (level 2). An organism
 * without data ("Coming soon") reports skipped. The expected values are
 * computed live from the site's own `/api/resistances`.
 *
 * amr.trend-info-button: the "i" on the Trend tile shows the CMS's trendTooltip.
 */

const LOADED = { timeout: 30_000 };

// Each test opens several dropdowns after an 8000-row response; the default 30 s is too tight.
test.setTimeout(120_000);

async function openView(
    page: Page,
    organism: string,
    view: string
): Promise<void> {
    await visit(
        page,
        `/antibiotic-resistance?microorganism=${encodeURIComponent(
            organism
        )}&view=${view}&lang=en`
    );
}

/**
 * Fails within seconds, not at the test timeout, when the page's filter
 * dropdowns cannot be found by their labels: a client built before the
 * dropdown labels (#1917) renders them without an accessible name.
 */
async function expectLabelledDropdowns(
    page: Page,
    keys: FilterKey[]
): Promise<void> {
    await expect(page.getByRole("combobox").first()).toBeVisible(LOADED);
    for (const key of keys) {
        await expect(filterDropdown(page, key))
            .toHaveCount(1, { timeout: 5_000 })
            .catch(() => {
                throw new Error(
                    `no dropdown labelled "${FILTER_LABELS[key]}": the filter dropdowns have no accessible name (client older than the dropdown labels of #1917?)`
                );
            });
    }
}

/**
 * Waits until `key`'s dropdown lists exactly `want` (the first poll doubles as
 * the "data loaded" wait); on failure, names the missing and unexpected options.
 */
async function expectOptions(
    page: Page,
    key: FilterKey,
    want: string[]
): Promise<void> {
    let problem: string | null = "no options read";
    await expect
        .poll(async () => {
            problem = diffNames(want, await dropdownOptionNames(page, key));
            return problem;
        }, LOADED)
        .toBeNull()
        .catch(() => {
            throw new Error(`${key} options differ: ${problem}`);
        });
}

/**
 * Whether the AMR page announces "Coming soon" for this organism. The page, not
 * the API, decides that: ESBL/AmpC E. coli has rows in the CMS but no charts yet.
 */
async function announcesComingSoon(
    page: Page,
    organism: string
): Promise<boolean> {
    await visit(page, "/antibiotic-resistance?lang=en");
    await page
        .getByRole("complementary")
        .getByRole("button", { name: organism, exact: true })
        .click(LOADED)
        .catch(() => {
            throw new Error(
                `no "${organism}" button in the AMR page's organism list (client older than this check?)`
            );
        });
    return page
        .getByRole("dialog")
        .filter({ hasText: "Coming soon" })
        .isVisible({ timeout: 3_000 })
        .catch(() => false);
}

for (const organism of ORGANISMS) {
    for (const view of VIEWS) {
        const params = { organism, view };

        test(
            `amr filters list the data, ${organism} ${view} @post-release`,
            {
                annotation: releaseCheck("amr.filter", {
                    ...params,
                    level: "1",
                }),
            },
            async ({ page, request }, testInfo) => {
                if (await announcesComingSoon(page, organism)) {
                    reportOutcome(
                        testInfo,
                        "skipped-no-data",
                        `${organism} shows "Coming soon" on this site`
                    );
                    return;
                }
                const rows = await resistanceRows(request, organism);
                expect(rows.length, `${organism} has data`).toBeGreaterThan(0);

                await openView(page, organism, view);
                const keys = filterKeys(organism);
                await expectLabelledDropdowns(page, keys);
                for (const key of keys) {
                    expect(
                        facetNames(rows, key).length,
                        `${key} has options in the data`
                    ).toBeGreaterThan(0);
                    await expectOptions(page, key, facetNames(rows, key));
                }
            }
        );

        test(
            `amr super-category narrows the matrix list, ${organism} ${view}`,
            {
                annotation: releaseCheck("amr.filter", {
                    ...params,
                    level: "2",
                }),
            },
            async ({ page, request }, testInfo) => {
                if (await announcesComingSoon(page, organism)) {
                    reportOutcome(
                        testInfo,
                        "skipped-no-data",
                        `${organism} shows "Coming soon" on this site`
                    );
                    return;
                }
                const rows = await resistanceRows(request, organism);
                expect(rows.length, `${organism} has data`).toBeGreaterThan(0);

                const allMatrices = facetNames(rows, "matrix");
                const pick = facetNames(rows, "superCategorySampleOrigin").find(
                    (name) =>
                        facetNames(
                            rowsWhere(rows, "superCategorySampleOrigin", [
                                name,
                            ]),
                            "matrix"
                        ).length < allMatrices.length
                );
                if (!pick) {
                    reportOutcome(
                        testInfo,
                        "could-not-verify",
                        `no super-category of ${organism} narrows the matrix list`
                    );
                    return;
                }

                await openView(page, organism, view);
                await expectLabelledDropdowns(page, [
                    "matrix",
                    "superCategorySampleOrigin",
                ]);
                await expectOptions(page, "matrix", allMatrices);

                await chooseOption(
                    page,
                    filterDropdown(page, "superCategorySampleOrigin"),
                    pick
                );

                await expectOptions(
                    page,
                    "matrix",
                    facetNames(
                        rowsWhere(rows, "superCategorySampleOrigin", [pick]),
                        "matrix"
                    )
                );
            }
        );
    }
}

for (const lang of LANGUAGES) {
    test(
        `amr trend information button, ${lang}`,
        { annotation: releaseCheck("amr.trend-info-button", { lang }) },
        async ({ page, request }) => {
            await checkTrendInfoButton(page, request, lang);
        }
    );
}
