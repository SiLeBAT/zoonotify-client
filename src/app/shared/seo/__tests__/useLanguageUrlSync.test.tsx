import React, { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
// eslint-disable-next-line import/named
import i18next, { i18n as I18nInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { BrowserRouter, MemoryRouter, useLocation } from "react-router-dom";
import { pageRoute } from "../../infrastructure/router/routes";
import { useLanguageUrlSync } from "../useLanguageUrlSync";

/**
 * A real i18next instance and a real router -- nothing about the hook is
 * mocked, so these tests drive the same path the browser does. The hook does no
 * translating, so an empty resource set is enough.
 */
async function createI18n(language: string): Promise<I18nInstance> {
    const instance = i18next.createInstance();
    await instance.use(initReactI18next).init({
        lng: language,
        fallbackLng: "de",
        resources: { de: {}, en: {} },
        interpolation: { escapeValue: false },
    });
    return instance;
}

type Rendered = {
    i18n: I18nInstance;
    search: () => string;
    hash: () => string;
    pathname: () => string;
};

async function renderAt(path: string, language = "de"): Promise<Rendered> {
    const instance = await createI18n(language);
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
        <I18nextProvider i18n={instance}>
            <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
        </I18nextProvider>
    );

    const { result } = renderHook(
        () => {
            useLanguageUrlSync();
            return useLocation();
        },
        { wrapper }
    );

    // The hook may change the language, which re-renders and then rewrites the
    // URL; let both effects settle before asserting.
    await act(async () => undefined);

    return {
        i18n: instance,
        search: () => result.current.search,
        hash: () => result.current.hash,
        pathname: () => result.current.pathname,
    };
}

describe("useLanguageUrlSync", () => {
    it("adopts the language the URL asks for, so a shared link opens in its own language", async () => {
        const { i18n } = await renderAt("/prevalence?lang=en", "de");

        await waitFor(() => expect(i18n.language).toBe("en"));
    });

    it("still honours a legacy ?locale= link, so old bookmarks and citations keep working", async () => {
        const { i18n } = await renderAt("/evaluations?locale=en", "de");

        await waitFor(() => expect(i18n.language).toBe("en"));
    });

    it("rewrites a legacy ?locale= link to ?lang= so the two spellings stop competing", async () => {
        const { search } = await renderAt("/evaluations?locale=en", "de");

        await waitFor(() => {
            expect(new URLSearchParams(search()).get("lang")).toBe("en");
            expect(new URLSearchParams(search()).has("locale")).toBe(false);
        });
    });

    it.each(Object.values(pageRoute))(
        "writes the active language into %s, so every URL is shareable",
        async (path) => {
            const { search } = await renderAt(path, "de");

            await waitFor(() =>
                expect(new URLSearchParams(search()).get("lang")).toBe("de")
            );
        }
    );

    it("leaves filter state intact, so AMR deep links survive the rewrite", async () => {
        const { search } = await renderAt(
            "/antibiotic-resistance?microorganism=E.coli&view=trend&s=eJyrVgpKLU4tLsnMz1MoLknMK04tKlbSUUpKTM5OLVayUipKzUst"
        );

        await waitFor(() => {
            const params = new URLSearchParams(search());
            expect(params.get("microorganism")).toBe("E.coli");
            expect(params.get("view")).toBe("trend");
            expect(params.get("s")).toBe(
                "eJyrVgpKLU4tLsnMz1MoLknMK04tKlbSUUpKTM5OLVayUipKzUst"
            );
            expect(params.get("lang")).toBe("de");
        });
    });

    it("keeps the anchor, so explanation deep links still scroll to their term", async () => {
        const { hash, pathname } = await renderAt(
            "/explanations?locale=en#salmonella"
        );

        await waitFor(() => {
            expect(hash()).toBe("#salmonella");
            expect(pathname()).toBe("/explanations");
        });
    });

    it("ignores an unsupported language rather than yanking the reader out of theirs", async () => {
        const { i18n } = await renderAt("/prevalence?lang=fr", "en");

        await waitFor(() => expect(i18n.language).toBe("en"));
    });

    it("corrects an unsupported language in the URL to the one actually in use", async () => {
        const { search } = await renderAt("/prevalence?lang=fr", "en");

        await waitFor(() =>
            expect(new URLSearchParams(search()).get("lang")).toBe("en")
        );
    });

    it("follows a language switch from the header flags instead of snapping back to the URL's language", async () => {
        const { i18n, search } = await renderAt("/prevalence?lang=en", "en");

        await act(async () => {
            await i18n.changeLanguage("de");
        });

        await waitFor(() => {
            expect(i18n.language).toBe("de");
            expect(new URLSearchParams(search()).get("lang")).toBe("de");
        });
    });

    describe("with the browser's own URL", () => {
        afterEach(() => window.history.replaceState(null, "", "/"));

        it("keeps filters a page wrote outside the router when the language is switched", async () => {
            window.history.replaceState(
                null,
                "",
                "/antibiotic-resistance?lang=en"
            );
            const instance = await createI18n("en");
            renderHook(() => useLanguageUrlSync(), {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <I18nextProvider i18n={instance}>
                        <BrowserRouter>{children}</BrowserRouter>
                    </I18nextProvider>
                ),
            });
            await act(async () => undefined);

            // AMR pages persist their filters with raw replaceState, which
            // the router never sees.
            window.history.replaceState(
                null,
                "",
                "/antibiotic-resistance?microorganism=E.+coli&view=trend&superCategorySampleOrigin=Turkey&lang=en"
            );

            await act(async () => {
                await instance.changeLanguage("de");
            });

            await waitFor(() => {
                const params = new URLSearchParams(window.location.search);
                expect(instance.language).toBe("de");
                expect(params.get("lang")).toBe("de");
                expect(params.get("microorganism")).toBe("E. coli");
                expect(params.get("view")).toBe("trend");
                expect(params.get("superCategorySampleOrigin")).toBe("Turkey");
            });
        });
    });
});
