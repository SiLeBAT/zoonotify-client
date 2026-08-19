import React, { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
// eslint-disable-next-line import/named
import i18next, { i18n as I18nInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { pageRoute } from "../../infrastructure/router/routes";
import seoDe from "../../../../locales/de/Seo.json";
import seoEn from "../../../../locales/en/Seo.json";
import { useSeo } from "../useSeo";

/**
 * A real i18next instance seeded from the real locale files -- only the HTTP
 * backend is swapped for in-memory resources. Nothing about the hook itself is
 * mocked, so these tests exercise the same path the browser does.
 */
async function createI18n(language: string): Promise<I18nInstance> {
    const instance = i18next.createInstance();
    await instance.use(initReactI18next).init({
        lng: language,
        fallbackLng: "de",
        ns: ["Seo"],
        defaultNS: "Seo",
        resources: { de: { Seo: seoDe }, en: { Seo: seoEn } },
        interpolation: { escapeValue: false },
    });
    return instance;
}

/** Mirrors the static tags src/index.html ships, so "updates in place rather
 *  than duplicating" is tested against the markup that really exists. */
function seedStaticHead(): void {
    document.head.innerHTML = `
        <title>ZooNotify — Zoonosen-Surveillancedaten des BfR</title>
        <meta name="description" content="static baseline" />
        <meta property="og:title" content="static baseline" />
        <meta property="og:description" content="static baseline" />
        <meta property="og:url" content="https://zoonotify.bfr.berlin/" />
        <link rel="canonical" href="https://zoonotify.bfr.berlin/" />
        <link rel="alternate" hreflang="de" href="https://zoonotify.bfr.berlin/?lang=de" />
        <link rel="alternate" hreflang="en" href="https://zoonotify.bfr.berlin/?lang=en" />
        <link rel="alternate" hreflang="x-default" href="https://zoonotify.bfr.berlin/" />
    `;
    document.documentElement.lang = "de";
}

async function renderAt(
    path: string,
    language = "de"
): Promise<{ i18n: I18nInstance }> {
    const instance = await createI18n(language);
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
        <I18nextProvider i18n={instance}>
            <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
        </I18nextProvider>
    );
    renderHook(() => useSeo(), { wrapper });
    return { i18n: instance };
}

const metaContent = (selector: string): string | null =>
    document.head.querySelector(selector)?.getAttribute("content") ?? null;

const linkHref = (selector: string): string | null =>
    document.head.querySelector(selector)?.getAttribute("href") ?? null;

const jsonLdScripts = (): HTMLScriptElement[] =>
    Array.from(
        document.head.querySelectorAll<HTMLScriptElement>(
            'script[type="application/ld+json"]'
        )
    );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonLd = (): any => {
    const [script] = jsonLdScripts();
    return script ? JSON.parse(script.textContent ?? "null") : null;
};

beforeEach(() => {
    seedStaticHead();
});

describe("useSeo", () => {
    it("gives a route its own title instead of the site-wide default", async () => {
        await renderAt("/prevalence");

        expect(document.title).toContain("Prävalenz");
    });

    it("gives every route its own title and description, so no two pages look alike in search results", async () => {
        const resolved = [];

        for (const path of Object.values(pageRoute)) {
            seedStaticHead();
            // eslint-disable-next-line no-await-in-loop
            await renderAt(path);
            resolved.push({
                path,
                title: document.title,
                description: metaContent('meta[name="description"]'),
            });
        }

        resolved.forEach(({ path, title, description }) => {
            expect(`${path}: ${title}`).not.toContain(".title");
            expect(`${path}: ${description}`).not.toContain(".description");
            expect(`${path}: ${description}`).not.toContain("static baseline");
        });

        expect(new Set(resolved.map((entry) => entry.title)).size).toBe(
            resolved.length
        );
        expect(new Set(resolved.map((entry) => entry.description)).size).toBe(
            resolved.length
        );
    });

    it("serves the metadata in the active language", async () => {
        await renderAt("/prevalence", "en");

        expect(document.title).toContain("Prevalence");
        expect(metaContent('meta[name="description"]')).toBe(
            seoEn.prevalence.description
        );
    });

    it("declares the active language on the document, not a hardcoded one", async () => {
        await renderAt("/prevalence", "en");

        expect(document.documentElement.lang).toBe("en");
    });

    it("re-resolves the head when the language changes mid-session", async () => {
        const { i18n } = await renderAt("/prevalence", "de");
        expect(document.title).toContain("Prävalenz");

        await act(async () => {
            await i18n.changeLanguage("en");
        });

        expect(document.title).toContain("Prevalence");
        expect(document.documentElement.lang).toBe("en");
    });

    it("points the canonical at this route in this language", async () => {
        await renderAt("/prevalence", "en");

        expect(linkHref('link[rel="canonical"]')).toBe(
            "http://localhost/prevalence?lang=en"
        );
    });

    it("keeps filter state out of the canonical, so filter combinations cannot mint endless URLs", async () => {
        await renderAt(
            "/antibiotic-resistance?microorganism=E.coli&view=trend&s=eJyrVg&lang=de"
        );

        expect(linkHref('link[rel="canonical"]')).toBe(
            "http://localhost/antibiotic-resistance?lang=de"
        );
    });

    it("cross-links the route's translations so they are not treated as duplicates", async () => {
        await renderAt("/evaluations", "de");

        expect(linkHref('link[rel="alternate"][hreflang="de"]')).toBe(
            "http://localhost/evaluations?lang=de"
        );
        expect(linkHref('link[rel="alternate"][hreflang="en"]')).toBe(
            "http://localhost/evaluations?lang=en"
        );
        expect(linkHref('link[rel="alternate"][hreflang="x-default"]')).toBe(
            "http://localhost/evaluations"
        );
    });

    it("keeps unknown paths out of the index instead of advertising a 404", async () => {
        await renderAt("/no-such-page");

        expect(metaContent('meta[name="robots"]')).toContain("noindex");
    });

    it("marks known routes as indexable, so a 404 visit cannot poison the next page", async () => {
        await renderAt("/no-such-page");
        expect(metaContent('meta[name="robots"]')).toContain("noindex");

        await renderAt("/prevalence");

        expect(metaContent('meta[name="robots"]')).not.toContain("noindex");
    });

    it("updates the static tags from index.html in place rather than appending a second copy", async () => {
        await renderAt("/prevalence", "en");

        expect(
            document.head.querySelectorAll('meta[name="description"]')
        ).toHaveLength(1);
        expect(
            document.head.querySelectorAll('link[rel="canonical"]')
        ).toHaveLength(1);
        expect(
            document.head.querySelectorAll(
                'link[rel="alternate"][hreflang="de"]'
            )
        ).toHaveLength(1);
    });

    it("keeps the Open Graph tags in step with the route, so shared links preview correctly", async () => {
        await renderAt("/prevalence", "en");

        expect(metaContent('meta[property="og:title"]')).toContain(
            "Prevalence"
        );
        expect(metaContent('meta[property="og:description"]')).toBe(
            seoEn.prevalence.description
        );
        expect(metaContent('meta[property="og:url"]')).toBe(
            "http://localhost/prevalence?lang=en"
        );
    });
});

describe("useSeo structured data", () => {
    it("describes a data route as a schema.org Dataset, so it can surface in Dataset Search", async () => {
        await renderAt("/prevalence");

        expect(jsonLd()["@type"]).toBe("Dataset");
    });

    it.each(["/prevalence", "/antibiotic-resistance", "/microbial-counts"])(
        "credits the BfR as the source of the dataset on %s",
        async (path) => {
            await renderAt(path, "en");
            const data = jsonLd();

            expect(data["@type"]).toBe("Dataset");
            // A raw i18n key would mean the copy is missing, not that it resolved.
            expect(data.name).not.toContain("datasetName");
            expect(data.name).toBeTruthy();
            expect(data.creator).toMatchObject({
                "@type": "GovernmentOrganization",
                url: "https://www.bfr.bund.de/",
            });
            expect(data.url).toBe(`http://localhost${path}?lang=en`);
            expect(data.inLanguage).toBe("en");
        }
    );

    it("does not claim licence terms or a reporting period it cannot verify", async () => {
        await renderAt("/prevalence");
        const data = jsonLd();

        expect(data.license).toBeUndefined();
        expect(data.temporalCoverage).toBeUndefined();
    });

    it("attributes the site itself to the BfR on the home route", async () => {
        await renderAt("/");
        const data = jsonLd();

        expect(data["@type"]).toBe("WebSite");
        expect(data.publisher).toMatchObject({
            "@type": "GovernmentOrganization",
            url: "https://www.bfr.bund.de/",
        });
        expect(data.inLanguage).toEqual(expect.arrayContaining(["de", "en"]));
    });

    it("still describes prose routes, so they are not structurally anonymous", async () => {
        await renderAt("/explanations");

        expect(jsonLd()["@type"]).toBe("WebPage");
    });

    it("emits exactly one block after navigating, so crawlers do not see a stale page described alongside the current one", async () => {
        await renderAt("/prevalence");
        await renderAt("/explanations");

        expect(jsonLdScripts()).toHaveLength(1);
        expect(jsonLd()["@type"]).toBe("WebPage");
    });

    it("re-describes the page when the language changes", async () => {
        const { i18n } = await renderAt("/prevalence", "de");
        expect(jsonLd().inLanguage).toBe("de");
        const germanName = jsonLd().name;

        await act(async () => {
            await i18n.changeLanguage("en");
        });

        expect(jsonLd().inLanguage).toBe("en");
        expect(jsonLd().name).not.toBe(germanName);
    });

    it("emits parseable JSON carrying the schema.org context", async () => {
        await renderAt("/microbial-counts");
        const [script] = jsonLdScripts();

        expect(script.getAttribute("type")).toBe("application/ld+json");
        expect(() => JSON.parse(script.textContent ?? "")).not.toThrow();
        expect(jsonLd()["@context"]).toBe("https://schema.org");
    });
});
