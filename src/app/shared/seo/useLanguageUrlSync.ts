import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { isSupportedLanguage, normalizeLanguage } from "./seo.model";

/** The query parameter that carries the active language. */
export const LANG_PARAM = "lang";

/** Pre-unification parameter name, still read so old links keep working. */
export const LEGACY_LANG_PARAM = "locale";

/**
 * Pages such as AMR and prevalence persist their filters with raw
 * `window.history.replaceState`, which the router never sees, so its
 * `location.search` can lag the address bar. Build on the live URL while it is
 * the same page, so rewriting `lang` cannot throw those filters away.
 */
function liveSearch(location: { pathname: string; search: string }): string {
    return window.location.pathname === location.pathname
        ? window.location.search
        : location.search;
}

/**
 * Single source of truth for the language <-> URL relationship.
 *
 * Mounted once inside the router; see Body-Router.component.tsx.
 */
export function useLanguageUrlSync(): void {
    const { i18n } = useTranslation();
    const location = useLocation();
    const history = useHistory();
    // What the previous run saw, to tell a language switch from a navigation.
    const previousRef = useRef<{ search: string; language: string } | null>(
        null
    );

    useEffect(() => {
        const active = normalizeLanguage(i18n.language);
        const previous = previousRef.current;
        previousRef.current = { search: location.search, language: active };

        // The reader switched language (the header flags) without navigating:
        // the URL's lang is merely stale, so i18next wins and the URL follows.
        const switchedInPlace =
            previous !== null &&
            previous.language !== active &&
            previous.search === location.search;

        const params = new URLSearchParams(liveSearch(location));
        const requested =
            params.get(LANG_PARAM) ?? params.get(LEGACY_LANG_PARAM);

        // URL -> i18next. Only a language we actually publish is honoured; an
        // unsupported value is left to the write-back below, which corrects the
        // URL instead of moving the reader.
        if (!switchedInPlace && requested && isSupportedLanguage(requested)) {
            const normalized = normalizeLanguage(requested);
            if (normalized !== active) {
                i18n.changeLanguage(normalized);
                return;
            }
        }

        // i18next -> URL, collapsing the legacy parameter onto the canonical one.
        if (
            params.get(LANG_PARAM) === active &&
            !params.has(LEGACY_LANG_PARAM)
        ) {
            return;
        }
        params.delete(LEGACY_LANG_PARAM);
        params.set(LANG_PARAM, active);
        history.replace({
            pathname: location.pathname,
            search: params.toString(),
            hash: location.hash,
        });
    }, [
        location.search,
        location.pathname,
        location.hash,
        i18n,
        i18n.language,
        history,
    ]);
}
