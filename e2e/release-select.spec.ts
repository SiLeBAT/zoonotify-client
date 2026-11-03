import { expect, test } from "@playwright/test";
import { comboboxByLabel } from "./release/support/select";

/**
 * The shared select locator, on a static page (CMS-free sweep). MUI appends the
 * chosen values to a select's accessible name.
 */
const LABELS = ["Matrix", "Matrix Group", "Sample (origin)"];

test.beforeEach(async ({ page }) => {
    await page.setContent(`
        <div role="combobox" aria-label="Matrix Group Poultry">x</div>
        <div role="combobox" aria-label="Matrix Beef">x</div>
        <div role="combobox" aria-label="Sample (origin)">x</div>
        <div role="combobox" aria-label="Sample origin">x</div>`);
});

test("a label does not match a longer label that starts with it", async ({
    page,
}) => {
    const matrix = comboboxByLabel(page, "Matrix", LABELS);
    await expect(matrix).toHaveCount(1);
    await expect(matrix).toHaveAttribute("aria-label", "Matrix Beef");
    await expect(comboboxByLabel(page, "Matrix Group", LABELS)).toHaveCount(1);
});

test("regex metacharacters in a label are literal", async ({ page }) => {
    await expect(comboboxByLabel(page, "Sample (origin)", LABELS)).toHaveCount(
        1
    );
});
