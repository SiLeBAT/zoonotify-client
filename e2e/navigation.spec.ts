import { expect, test } from "@playwright/test";
import { menuToggle, navLink, visit } from "./support/app";

/** Header label -> the path that label must lead to, in German (the default). */
const NAV = [
    { label: "Erläuterungen", path: "/explanations" },
    { label: "Auswertungen", path: "/evaluations" },
    { label: "Prävalenz", path: "/prevalence" },
    { label: "Antibiotikaresistenz", path: "/antibiotic-resistance" },
    { label: "Keimzahlen", path: "/microbial-counts" },
    { label: "Antibiotikaeinsatz", path: "/antimicrobial" },
    { label: "Externe Links", path: "/links" },
] as const;

test.describe("the header navigates the whole site", () => {
    for (const { label, path } of NAV) {
        test(`"${label}" opens ${path}`, async ({ page }) => {
            await visit(page, "/");

            await navLink(page, label).click();

            await expect(page).toHaveURL(new RegExp(`^[^?]*${path}\?`));
            await expect(page.locator("main")).toBeVisible();
        });
    }
});

test("navigating stays in the SPA rather than reloading the document", async ({
    page,
}) => {
    await visit(page, "/");
    // Survives a client-side route change, not a document load.
    await page.evaluate(() => {
        (window as unknown as { __e2e: boolean }).__e2e = true;
    });

    await navLink(page, "Prävalenz").click();
    await expect(page).toHaveURL(/\/prevalence\?/);

    const survived = await page.evaluate(
        () => (window as unknown as { __e2e?: boolean }).__e2e === true
    );
    expect(survived).toBe(true);
});

test("the wordmark returns to the home page", async ({ page }) => {
    await visit(page, "/links");

    await navLink(page, "ZooNotify").click();

    await expect(page).toHaveURL(/\/\?lang=de$/);
});

test.describe("narrow viewport", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("the nav is reachable through the hamburger drawer", async ({
        page,
    }) => {
        await visit(page, "/");

        // Closed drawer: the desktop bar is hidden by media query and the
        // drawer by display:none, so neither copy of the link is visible.
        await expect(navLink(page, "Prävalenz")).toHaveCount(0);

        await menuToggle(page).click();
        await navLink(page, "Prävalenz").click();

        await expect(page).toHaveURL(/\/prevalence\?/);
        // Opening a page closes the drawer again.
        await expect(navLink(page, "Prävalenz")).toHaveCount(0);
    });
});
