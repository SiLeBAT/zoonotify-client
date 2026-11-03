import { expect, test as setup } from "@playwright/test";
import { CLIENT_COMMIT_ANNOTATION } from "./support/annotations";
import { visit } from "../support/app";
import {
    commitMatches,
    RC_GUARD_MESSAGE,
    servedCommit,
} from "./support/rc-guard";

/**
 * Setup step of the `release` project: every check depends on it, so a failure
 * here stops the run before any check. The commit comparison is active only when
 * E2E_EXPECTED_COMMIT is set (the RC run); the post-release run has no commit
 * to compare, but still records what the footer serves.
 */
const expected = process.env.E2E_EXPECTED_COMMIT;

setup("the site serves the commit under test", async ({ page }) => {
    await visit(page, "/?lang=en");
    // The commits live in the tooltip of the footer's "last update" text.
    await page
        .getByRole("contentinfo")
        .getByText(/Last software update/)
        .hover();
    const tooltip = await page.getByRole("tooltip").innerText();
    const served = servedCommit(tooltip);

    // Always recorded: the release report header shows what is being served.
    if (served) {
        setup.info().annotations.push({
            type: CLIENT_COMMIT_ANNOTATION,
            description: served,
        });
    }
    if (!expected) return;

    expect(
        commitMatches(expected, served),
        `${RC_GUARD_MESSAGE}: expected client commit ${expected}, the footer shows ${
            served ?? "no client commit"
        }`
    ).toBe(true);
});
