import { expect, Locator, Page } from "@playwright/test";
import { normalise } from "./oracle";

/**
 * Helpers for the MUI selects the release checks drive. MUI puts the selected
 * values into a select's accessible name, so a select is found by its label as
 * a prefix.
 */

const escapeRegExp = (text: string): string =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The select called `label`. Regex metacharacters in the label are escaped, and
 * a label that is the start of a longer one ("Matrix" / "Matrix Group") does
 * not match the longer one: pass every label the page shows as `labels`.
 */
export function comboboxByLabel(
    page: Page,
    label: string,
    labels: readonly string[] = []
): Locator {
    const longer = labels
        .filter((other) => other.startsWith(`${label} `))
        .map((other) => escapeRegExp(other.slice(label.length + 1)));
    const exclude = longer.length > 0 ? `(?!\\s(?:${longer.join("|")}))` : "";
    return page.getByRole("combobox", {
        name: new RegExp(`^${escapeRegExp(label)}${exclude}(\\s|$)`),
    });
}

/**
 * How a select is opened. A click is the user's way; focus plus Enter is for
 * selects another element overlaps (the info icon over a select at 360 px).
 */
export type OpenWith = "click" | "keyboard";

async function open(select: Locator, how: OpenWith): Promise<void> {
    if (how === "keyboard") {
        await select.focus();
        await select.press("Enter");
    } else {
        await select.click();
    }
}

/** Closes an open select (the client applies its staged selection on close). */
export async function closeSelect(page: Page): Promise<void> {
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
}

/**
 * Opens the select and returns its option texts, whitespace-normalised, in
 * list order (spacer options come back as empty strings). Leaves it open.
 */
export async function readOptions(
    page: Page,
    select: Locator,
    how: OpenWith = "click"
): Promise<string[]> {
    await open(select, how);
    const options = page.getByRole("listbox").getByRole("option");
    await expect(options.first()).toBeVisible();
    return (await options.allTextContents()).map(normalise);
}

/**
 * Opens the select and clicks the first option whose text satisfies `match`
 * (a string means the exact, whitespace-normalised text), then closes it.
 * Returns false, with the select closed, when no option matches and
 * `optional` is set; fails otherwise.
 */
export async function chooseOption(
    page: Page,
    select: Locator,
    match: string | ((text: string) => boolean),
    {
        how = "click",
        optional = false,
        close = true,
        what = "the select",
    }: {
        how?: OpenWith;
        optional?: boolean;
        close?: boolean;
        what?: string;
    } = {}
): Promise<boolean> {
    const texts = await readOptions(page, select, how);
    const matches =
        typeof match === "string"
            ? (text: string) => text === normalise(match)
            : match;
    const index = texts.findIndex(matches);
    if (index < 0 && optional) {
        await closeSelect(page);
        return false;
    }
    expect(index, `${what} offers the option`).toBeGreaterThanOrEqual(0);
    await page.getByRole("listbox").getByRole("option").nth(index).click();
    if (close) await closeSelect(page);
    return true;
}
