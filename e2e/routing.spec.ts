import { expect, test } from "@playwright/test";
import { SEO_ROUTES } from "../src/app/shared/seo/seo.model";
import seoDe from "../src/locales/de/Seo.json";
import {
    canonicalHref,
    documentLanguage,
    metaContent,
    navLink,
    stubDataProtection,
    visit,
} from "./support/app";

/**
 * The routing table is imported rather than restated so a route added to the
 * app is a route this suite starts covering, with no second list to remember.
 */
const copy = seoDe as Record<string, { title: string; description: string }>;

function expectedTitle(key: string): string {
    const { title } = copy[key];
    // The home title already names the site; useSeo skips the suffix there.
    return key === "home" ? title : `${title} — ZooNotify`;
}

test.describe("every published route serves its page", () => {
    for (const route of SEO_ROUTES) {
        test(`${route.path} renders with its own metadata`, async ({
            page,
        }) => {
            await stubDataProtection(page);
            await visit(page, route.path);

            await expect(page).toHaveTitle(expectedTitle(route.key));
            await expect(page.locator("main")).toBeVisible();
            // The whole point of the PageLayout height chain: a page wired up
            // wrongly collapses <main> to zero height and hides its content
            // without throwing anything a smoke test would notice.
            const box = await page.locator("main").boundingBox();
            expect(box?.height ?? 0).toBeGreaterThan(0);

            expect(await documentLanguage(page)).toBe("de");
            expect(await metaContent(page, "description")).toBe(
                copy[route.key].description
            );
            expect(await metaContent(page, "robots")).toBe("index, follow");
        });
    }
});

test("an unknown path renders the 404 page and is kept out of the index", async ({
    page,
}) => {
    await visit(page, "/no-such-page");

    await expect(page).toHaveTitle(expectedTitle("notFound"));
    expect(await metaContent(page, "robots")).toBe("noindex, follow");
    // Crawlers still need to follow the navigation off a 404.
    await expect(navLink(page, "Erläuterungen")).toBeVisible();
});

test("canonical carries the language and nothing else", async ({ page }) => {
    // Filter state on the data pages must stay out of the canonical URL --
    // folding it in mints a fresh canonical for every filter combination.
    await visit(page, "/prevalence?microorganism=Salmonella&view=main");

    const canonical = await canonicalHref(page);
    expect(canonical).not.toBeNull();
    const url = new URL(canonical as string);
    expect(url.pathname).toBe("/prevalence");
    expect(url.search).toBe("?lang=de");
});

test("deep-linking a route directly serves the app, not a 404 from the server", async ({
    page,
}) => {
    // historyApiFallback in dev, and the equivalent rewrite in the deployed
    // build: a hard load of a client route has to return index.html.
    const response = await page.goto("/evaluations");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(expectedTitle("evaluations"));
});
