import { expect, Page, test } from "@playwright/test";
import { visit } from "../support/app";
import { releaseCheck, reportOutcome } from "./support/annotations";
import {
    dropdown,
    facet,
    filterKeys,
    optionNames,
    ORGANISMS,
    resistanceRows,
    VIEWS,
    where,
} from "./support/amr";
import { checkTrendInfoButton, LANGUAGES } from "./support/amrInfoButton";

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
        .click();
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
                for (const key of filterKeys(organism)) {
                    expect(
                        facet(rows, key).length,
                        `${key} has options in the data`
                    ).toBeGreaterThan(0);
                    // Options appear once the response is in, so the first
                    // poll doubles as the "data loaded" wait.
                    await expect
                        .poll(() => optionNames(page, key), LOADED)
                        .toEqual(facet(rows, key));
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

                const allMatrices = facet(rows, "matrix");
                const pick = facet(rows, "superCategorySampleOrigin").find(
                    (name) =>
                        facet(
                            where(rows, "superCategorySampleOrigin", [name]),
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
                await expect
                    .poll(() => optionNames(page, "matrix"), LOADED)
                    .toEqual(allMatrices);

                await dropdown(page, "superCategorySampleOrigin").click();
                await page
                    .getByRole("option", { name: pick, exact: true })
                    .click();
                await page.keyboard.press("Escape");

                await expect
                    .poll(() => optionNames(page, "matrix"), LOADED)
                    .toEqual(
                        facet(
                            where(rows, "superCategorySampleOrigin", [pick]),
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
