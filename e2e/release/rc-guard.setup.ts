import { expect, test as setup } from "@playwright/test";
import { visit } from "../support/app";
import {
    commitMatches,
    RC_GUARD_MESSAGE,
    servedCommit,
} from "./support/rc-guard";

/**
 * Setup step of the `release` project: every check depends on it, so a failure
 * here stops the run before any check. Active only when E2E_EXPECTED_COMMIT is
 * set (the RC run); the post-release run has no commit to compare.
 */
const expected = process.env.E2E_EXPECTED_COMMIT;

setup("the site serves the commit under test", async ({ page }) => {
    setup.skip(!expected, "E2E_EXPECTED_COMMIT is not set");

    await visit(page, "/?lang=en");
    // The commits live in the tooltip of the footer's "last update" text.
    await page
        .getByRole("contentinfo")
        .getByText(/Last software update/)
        .hover();
    const tooltip = await page.getByRole("tooltip").innerText();
    const served = servedCommit(tooltip);

    expect(
        commitMatches(expected!, served),
        `${RC_GUARD_MESSAGE}: expected client commit ${expected}, the footer shows ${
            served ?? "no client commit"
        }`
    ).toBe(true);
});
