import { expect, test } from "@playwright/test";
import seoDe from "../src/locales/de/Seo.json";
import seoEn from "../src/locales/en/Seo.json";
import {
    documentLanguage,
    langParam,
    languageButton,
    navLink,
    visit,
} from "./support/app";

/**
 * Language lives in one place -- `?lang=` -- and useLanguageUrlSync is the only
 * thing allowed to write it. These are the cases that broke when pages each
 * ran their own sync and wrote two different parameter names at each other.
 */

const DE_PREVALENCE = `${seoDe.prevalence.title} — ZooNotify`;
const EN_PREVALENCE = `${seoEn.prevalence.title} — ZooNotify`;

test("a shared ?lang=en link renders English on the first paint", async ({
    page,
}) => {
    await visit(page, "/prevalence?lang=en");

    await expect(page).toHaveTitle(EN_PREVALENCE);
    expect(await documentLanguage(page)).toBe("en");
    expect(langParam(page)).toBe("en");
    await expect(navLink(page, "Explanations")).toBeVisible();
});

test("no language in the URL falls back to German and says so in the URL", async ({
    page,
}) => {
    await visit(page, "/prevalence");

    await expect(page).toHaveTitle(DE_PREVALENCE);
    expect(await documentLanguage(page)).toBe("de");
    expect(langParam(page)).toBe("de");
});

test("a legacy ?locale= link still works and collapses onto ?lang=", async ({
    page,
}) => {
    await visit(page, "/prevalence?locale=en");

    await expect(page).toHaveTitle(EN_PREVALENCE);
    expect(langParam(page)).toBe("en");
    expect(new URL(page.url()).searchParams.has("locale")).toBe(false);
});

test("a legacy ?locale= link beats a language already cached in the browser", async ({
    page,
}) => {
    // The case that hid this bug: with `en` already in localStorage the alias
    // appeared to work, because i18next reached the right language on its own
    // rather than because the link was honoured. Seed the opposite preference
    // so only the link can be responsible for the result.
    await page.addInitScript(() => {
        window.localStorage.setItem("i18nextLng", "de");
    });

    await visit(page, "/prevalence?locale=en");

    await expect(page).toHaveTitle(EN_PREVALENCE);
    expect(langParam(page)).toBe("en");
});

test("the canonical ?lang= wins when a URL carries both spellings", async ({
    page,
}) => {
    await visit(page, "/prevalence?lang=de&locale=en");

    await expect(page).toHaveTitle(DE_PREVALENCE);
    expect(langParam(page)).toBe("de");
    expect(new URL(page.url()).searchParams.has("locale")).toBe(false);
});

test("an unpublished language corrects the URL instead of moving the reader", async ({
    page,
}) => {
    await visit(page, "/prevalence?lang=fr");

    await expect(page).toHaveTitle(DE_PREVALENCE);
    expect(langParam(page)).toBe("de");
});

test("switching language in place rewrites the URL and keeps the page", async ({
    page,
}) => {
    await visit(page, "/prevalence?lang=de");

    await languageButton(page, "en").click();

    await expect(page).toHaveTitle(EN_PREVALENCE);
    await expect(page).toHaveURL(/\/prevalence\?/);
    expect(langParam(page)).toBe("en");
});

test("switching language preserves the filter state the data pages keep in the URL", async ({
    page,
}) => {
    // The data pages write filters with raw history.replaceState, which the
    // router never sees -- rewriting `lang` off a stale search string dropped
    // them.
    await visit(page, "/prevalence?lang=de");
    await page.evaluate(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("microorganism", "Salmonella");
        window.history.replaceState({}, "", url.toString());
    });

    await languageButton(page, "en").click();

    await expect(page).toHaveTitle(EN_PREVALENCE);
    const params = new URL(page.url()).searchParams;
    expect(params.get("lang")).toBe("en");
    expect(params.get("microorganism")).toBe("Salmonella");
});

test("the chosen language survives navigation", async ({ page }) => {
    await visit(page, "/?lang=en");

    await navLink(page, "External Links").click();

    await expect(page).toHaveURL(/\/links\?/);
    expect(langParam(page)).toBe("en");
    expect(await documentLanguage(page)).toBe("en");
});
