import AxeBuilder from "@axe-core/playwright";
import { expect, Page, test } from "@playwright/test";
import { stubDataProtection, visit } from "./support/app";

/**
 * axe over the routes that render fully without a CMS. Chart pages are left
 * out until the suite has data fixtures: without data they only show their
 * empty state, which says nothing about the charts.
 */
const ROUTES = ["/", "/dataProtectionDeclaration"] as const;

const WCAG_21_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function violations(page: Page): Promise<string[]> {
    // Without a CMS the error snackbar fades in; scanning mid-fade measures
    // half-transparent colours and reports contrast failures that aren't real.
    await page.waitForLoadState("networkidle");
    await page.evaluate(() =>
        Promise.all(document.getAnimations().map((a) => a.finished))
    );
    const { violations: found } = await new AxeBuilder({ page })
        .withTags(WCAG_21_AA)
        .analyze();
    return found.map(
        (v) =>
            `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(", ")}`
    );
}

for (const width of [1280, 360]) {
    test.describe(`at ${width}px`, () => {
        test.use({ viewport: { width, height: 800 } });

        for (const path of ROUTES) {
            test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
                await stubDataProtection(page);
                await visit(page, path);

                expect(await violations(page)).toEqual([]);
            });
        }
    });
}
