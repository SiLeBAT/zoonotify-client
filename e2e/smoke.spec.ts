import { expect, test } from "@playwright/test";
import seoDe from "../src/locales/de/Seo.json";
import seoEn from "../src/locales/en/Seo.json";
import { documentLanguage, langParam, visit } from "./support/app";

/**
 * Post-deploy smoke checks, tagged @smoke so a deployment can run just these:
 *
 *     E2E_BASE_URL=https://zoonotify-dev.bfr.berlin npm run test:e2e:smoke
 *
 * They deliberately assert what only a real deployment can get wrong -- the
 * built bundle booting at all, the web server's SPA rewrite, the client
 * reaching the CMS -- rather than re-running application logic the CI sweep
 * already covered against a dev server. Keeping the set small and
 * deployment-shaped is what keeps a red smoke run meaningful.
 *
 * They also run as part of the ordinary CI sweep, so they cannot rot unnoticed.
 */

/** Whether this run drives a deployed environment rather than a dev server. */
const deployed = process.env.E2E_BASE_URL !== undefined;

test("@smoke the deployed app boots and serves the home page", async ({
    page,
}) => {
    await visit(page, "/");

    await expect(page).toHaveTitle(seoDe.home.title);
    await expect(page.locator("main")).toBeVisible();
});

test("@smoke a deep-linked route is served by the web server, not a hard 404", async ({
    page,
}) => {
    // The check the dev server cannot stand in for: a hard load of a client
    // route has to be rewritten to index.html by whatever serves the docroot.
    // Get this wrong and every shared or bookmarked link breaks, while the
    // site still looks perfect to anyone who arrived at `/` and clicked.
    const response = await page.goto("/prevalence");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(`${seoDe.prevalence.title} — ZooNotify`);
});

test("@smoke an unknown path falls back to the app shell and renders the 404 page", async ({
    page,
}) => {
    // Status is deliberately not asserted: a static host may answer an unknown
    // path with either 200 or 404, and both are fine as long as the app shell
    // comes back and renders its own 404 rather than the host's.
    await visit(page, "/no-such-page");

    await expect(page).toHaveTitle(`${seoDe.notFound.title} — ZooNotify`);
});

test("@smoke the deployed bundle serves the requested language", async ({
    page,
}) => {
    await visit(page, "/prevalence?lang=en");

    await expect(page).toHaveTitle(`${seoEn.prevalence.title} — ZooNotify`);
    expect(await documentLanguage(page)).toBe("en");
});

test("@smoke the deployed bundle honours a legacy ?locale= link", async ({
    page,
}) => {
    // Doubles as the shipped-or-not check for the init-time language fix: the
    // old build answers this in German.
    await visit(page, "/prevalence?locale=en");

    await expect(page).toHaveTitle(`${seoEn.prevalence.title} — ZooNotify`);
    expect(langParam(page)).toBe("en");
});

test("@smoke the deployed client reaches the CMS", async ({ page }) => {
    test.skip(
        !deployed,
        "needs a deployed CMS; the CI sweep deliberately runs without one"
    );

    // The privacy policy bails out to a bare error *outside*
    // PageLayoutComponent when its fetch fails, so it has no <main> at all in
    // that state. A visible <main> here therefore means the deployed client
    // reached the CMS and got usable content back -- the one thing the
    // CMS-free CI run can never tell us.
    await visit(page, "/dataProtectionDeclaration");

    await expect(page.locator("main")).toBeVisible();
    await expect(page).toHaveTitle(`${seoDe.dataProtection.title} — ZooNotify`);
});
