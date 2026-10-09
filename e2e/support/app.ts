import { expect, Locator, Page } from "@playwright/test";

/**
 * Header nav links are rendered twice -- once for the desktop bar, once for the
 * mobile drawer -- so a bare role query always matches two elements. Which one
 * is live is a pure media-query call, hence filtering on visibility rather than
 * picking an index.
 */
export function navLink(page: Page, name: string): Locator {
    return page
        .getByRole("link", { name, exact: true })
        .locator("visible=true");
}

/** The `<link rel="canonical">` href useSeo maintains, or null before it runs. */
export async function canonicalHref(page: Page): Promise<string | null> {
    return page
        .locator('link[rel="canonical"]')
        .getAttribute("href", { timeout: 15_000 });
}

/** Content of a `<meta name="...">` tag. */
export function metaContent(page: Page, name: string): Promise<string | null> {
    return page.locator(`meta[name="${name}"]`).getAttribute("content");
}

/**
 * Waits for the app shell to be interactive. The translation catalogues load
 * over HTTP behind a Suspense boundary, so on a cold visit the router -- and
 * therefore every title, canonical and nav link this suite asserts on -- does
 * not exist yet.
 */
export async function waitForAppShell(page: Page): Promise<void> {
    await expect(navLink(page, "ZooNotify")).toBeVisible({ timeout: 30_000 });
}

/** Visits a path and waits for the shell, the usual opening of every test. */
export async function visit(page: Page, path: string): Promise<void> {
    await page.goto(path);
    await waitForAppShell(page);
}

/** The `lang` attribute useSeo mirrors onto `<html>`. */
export function documentLanguage(page: Page): Promise<string | null> {
    return page.locator("html").getAttribute("lang");
}

/** `?lang=` as the address bar currently has it. */
export function langParam(page: Page): string | null {
    return new URL(page.url()).searchParams.get("lang");
}

/**
 * The header's flag buttons carry no accessible name -- they render a flag as a
 * CSS background on an empty button -- so there is nothing to query them by but
 * position. The hamburger is the only other button in the header and it does
 * have a label, which is what makes the `:not([aria-label])` narrowing safe.
 */
export function languageButton(page: Page, language: "de" | "en"): Locator {
    return page
        .locator("header button:not([aria-label])")
        .nth(language === "de" ? 0 : 1);
}

/** The mobile drawer toggle, shown only under the 768px breakpoint. */
export function menuToggle(page: Page): Locator {
    return page.getByRole("button", { name: "Toggle Menu" });
}

/**
 * The privacy-policy page is the one route that will not render its own layout
 * without the CMS: when the fetch fails it returns a bare <Typography> error
 * *outside* PageLayoutComponent, so the page has no <main> at all. Stubbing
 * that single endpoint keeps the suite CMS-free while still exercising the
 * page's real layout rather than its error branch.
 */
export async function stubDataProtection(page: Page): Promise<void> {
    await page.route("**/data-protection-declaration*", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                data: {
                    subheading: "E2E subheading",
                    content: "E2E content",
                },
                meta: {},
            }),
        })
    );
}
