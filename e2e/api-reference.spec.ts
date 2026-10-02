import { expect, test } from "@playwright/test";
import spec from "../src/assets/api-docs/openapi.json";

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
    expect(await response.json()).toEqual(spec);
});
