import { expect, test } from "@playwright/test";
import prevalenceEn from "../../src/locales/en/PrevalencePage.json";
import {
    DIMENSIONS,
    expectFacet,
    loadFacetRows,
    openPrevalencePage,
} from "./support/prevalence-filters";

/**
 * Proves the prevalence data filter check can fail: the browser is served an
 * /api/prevalences response with one sample origin removed while the oracle
 * reads the real one, so the comparison must reject the dropdown. Not a release
 * check itself (no annotation), so the report never lists it.
 */
const labels = prevalenceEn as Record<string, string>;

test("a response missing one value fails the options comparison", async ({
    page,
    request,
}) => {
    const rows = await loadFacetRows(request, "en");
    const dropped = rows.find((row) => row.values.sampleOrigin)!.values
        .sampleOrigin!.id;

    await page.route("**/api/prevalences?*", async (route) => {
        const response = await route.fetch();
        const json = await response.json();
        json.data = json.data.filter(
            (item: any) => item.sampleOrigin?.documentId !== dropped
        );
        await route.fulfill({ response, json });
    });
    await openPrevalencePage(page, "en", labels);

    // Every dimension whose options come from other rows may differ; the
    // sample origin list certainly lacks the dropped value.
    expect(DIMENSIONS.map((d) => d.dim)).toContain("sampleOrigin");
    await expect(
        expectFacet(page, labels, rows, {}, "sampleOrigin")
    ).rejects.toThrow(/sampleOrigin options differ/);
});
