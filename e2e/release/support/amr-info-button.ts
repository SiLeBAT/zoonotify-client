import { APIRequestContext, expect, Page } from "@playwright/test";
import { visit } from "../../support/app";
import { LOCALES } from "./locales";
import { apiGet, Locale, normalise } from "./oracle";

/**
 * The "i" on the Trend tile of the AMR page must show the CMS's `trendTooltip`
 * (`/api/amr-page`) on hover. The page renders no button at all when the CMS
 * field is empty, so an empty oracle fails here instead of passing vacuously.
 */
export async function checkTrendInfoButton(
    page: Page,
    request: APIRequestContext,
    lang: Locale
): Promise<void> {
    const { trendTooltip } = (await apiGet(request, "/amr-page", lang)).data;
    expect(trendTooltip, "the CMS holds a trendTooltip").toBeTruthy();

    await visit(page, `/antibiotic-resistance?lang=${lang}`);
    const button = page.getByRole("button", {
        name: LOCALES[lang].amr.MoreInfoOnTrend,
        exact: true,
    });
    await expect(button, "the information button is shown").toBeVisible({
        timeout: 30_000,
    });

    await button.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    expect(normalise((await tooltip.textContent()) ?? "")).toBe(
        normalise(trendTooltip)
    );
}
