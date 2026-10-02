import { expect, Locator, Page, test } from "@playwright/test";
import spec from "../src/assets/api-docs/openapi.json";
import { visit } from "./support/app";

/**
 * The API reference is a static Swagger UI page outside the SPA, assembled into
 * public/ by cp:api-docs. Its spec is imported rather than restated, so the
 * expectations follow whatever was last synced from zoonotify-cms.
 */
const PAGE = "/assets/api-docs/";
const documentedPaths = Object.keys(spec.paths).sort();

test("the API reference page renders every documented operation", async ({
    page,
}) => {
    await page.goto(PAGE);

    await expect(page).toHaveTitle("API reference — ZooNotify");
    await expect(
        page.getByRole("link", { name: "← ZooNotify" })
    ).toHaveAttribute("href", "/");
    await expect(page.locator(".info .title")).toContainText(spec.info.title);

    const operations = page.locator(".opblock.opblock-get");
    await expect(operations).toHaveCount(documentedPaths.length);
    const renderedPaths = await page
        .locator(".opblock-summary-path")
        .evaluateAll((nodes) =>
            nodes.map((node) => node.getAttribute("data-path"))
        );
    expect(renderedPaths.sort()).toEqual(documentedPaths);
});

test("the spec behind the page is downloadable", async ({ request }) => {
    const response = await request.get(`${PAGE}openapi.json`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.openapi).toBe("3.0.3");
    expect(body).toEqual(spec);
});

/** The footer link, from the visible footer only (the label is the contract). */
const footerLink = (page: Page, name: string): Locator =>
    page.getByRole("contentinfo").getByRole("link", { name, exact: true });

test.describe("the footer links to the API reference", () => {
    const LABELS = { en: "API reference", de: "API-Referenz" } as const;
    const LAYOUTS = {
        desktop: { width: 1280, height: 900 },
        mobile: { width: 390, height: 844 },
    };

    for (const [layout, viewport] of Object.entries(LAYOUTS)) {
        for (const [lang, label] of Object.entries(LABELS)) {
            test(`as "${label}" for ?lang=${lang} on ${layout}`, async ({
                page,
            }) => {
                await page.setViewportSize(viewport);
                await visit(page, `/?lang=${lang}`);

                const link = footerLink(page, label);
                await expect(link).toBeVisible();
                await expect(link).toHaveAttribute("href", PAGE);
            });
        }
    }

    test("following it loads Swagger UI as a full page", async ({ page }) => {
        await visit(page, "/?lang=en");

        await footerLink(page, LABELS.en).click();

        await expect(page).toHaveURL(new RegExp(`${PAGE}$`));
        await expect(page).toHaveTitle("API reference — ZooNotify");
        await expect(page.locator(".opblock").first()).toBeVisible();
    });
});
